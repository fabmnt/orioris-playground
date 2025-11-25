'use client'

import { ExtractionResult, Tool } from '@/app.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { extractionService } from '@/services/extraction-service'
import { useMutation } from '@tanstack/react-query'
import { ChevronRight, Info, Maximize2, Minimize2, MoreVertical, Trash2, Upload } from 'lucide-react'
import { useState } from 'react'
import { Shimmer } from './ai-elements/shimmer'

const MAX_EXTRACTIONS = 5

interface PDFResultsProps {
  file: File
  onReset?: () => void
}

interface ExtractionConfig {
  tool: Tool
  processOutput: boolean
  tables: boolean
  text: boolean
}

interface Extraction {
  id: string
  tool: Tool
  status: 'pending' | 'success' | 'error'
  data?: ExtractionResult
  error?: string
  timestamp: number
  abortController?: AbortController
  config: ExtractionConfig
}

function FormattedResults({ data }: { data: ExtractionResult }) {
  const hasText = data.text && data.text.length > 0
  const hasTables = data.tables && data.tables[0] && Object.keys(data.tables[0]).length > 0

  if (!hasText && !hasTables) {
    return <div className='text-muted-foreground text-sm'>No content extracted.</div>
  }

  // If only one type of content exists, show it without tabs
  if (hasText && !hasTables) {
    return (
      <div className='space-y-4'>
        {data.text!.map((paragraph, i) => (
          <p
            key={i}
            className='text-sm leading-relaxed'
          >
            {paragraph}
          </p>
        ))}
      </div>
    )
  }

  if (hasTables && !hasText) {
    return (
      <div className='space-y-4'>
        {Object.entries(data.tables![0]).map(([key, table]) => (
          <div
            key={key}
            className='space-y-2'
          >
            <h4 className='text-muted-foreground text-sm font-medium'>{key}</h4>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    {table.headers.map((header, i) => (
                      <TableHead key={i}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {table.values.map((row, i) => (
                    <TableRow key={i}>
                      {row.map((cell, j) => (
                        <TableCell key={j}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Both text and tables exist, show tabs
  return (
    <Tabs
      defaultValue='text'
      className='w-full'
    >
      <TabsList>
        <TabsTrigger value='text'>Text</TabsTrigger>
        <TabsTrigger value='tables'>Tables</TabsTrigger>
      </TabsList>
      <TabsContent
        value='text'
        className='mt-4 space-y-4'
      >
        {data.text!.map((paragraph, i) => (
          <p
            key={i}
            className='text-sm leading-relaxed'
          >
            {paragraph}
          </p>
        ))}
      </TabsContent>
      <TabsContent
        value='tables'
        className='mt-4 space-y-4'
      >
        {Object.entries(data.tables![0]).map(([key, table]) => (
          <div
            key={key}
            className='space-y-2'
          >
            <h4 className='text-muted-foreground text-sm font-medium'>{key}</h4>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    {table.headers.map((header, i) => (
                      <TableHead key={i}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {table.values.map((row, i) => (
                    <TableRow key={i}>
                      {row.map((cell, j) => (
                        <TableCell key={j}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}
      </TabsContent>
    </Tabs>
  )
}

export function PDFResults({ file, onReset }: PDFResultsProps) {
  const [tool, setTool] = useState<Tool>('spacy')
  const [processOutput, setProcessOutput] = useState(true)
  const [tables, setTables] = useState(true)
  const [text, setText] = useState(true)
  const [extractions, setExtractions] = useState<Extraction[]>([])
  const [activeTab, setActiveTab] = useState<string>('')
  const [infoDialogOpen, setInfoDialogOpen] = useState(false)
  const [selectedExtraction, setSelectedExtraction] = useState<Extraction | null>(null)
  const [showRaw, setShowRaw] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const { mutateAsync: extract } = useMutation({
    mutationFn: extractionService.query.extract,
  })

  const handleSubmit = async () => {
    if (extractions.length >= MAX_EXTRACTIONS) {
      return
    }

    const id = Math.random().toString(36).substring(7)
    const abortController = new AbortController()
    const config: ExtractionConfig = {
      tool,
      processOutput,
      tables,
      text,
    }
    const newExtraction: Extraction = {
      id,
      tool,
      status: 'pending',
      timestamp: Date.now(),
      abortController,
      config,
    }

    setExtractions((prev) => [...prev, newExtraction])
    setActiveTab(id)

    try {
      const result = await extract({
        tool,
        processOutput,
        pdf: file,
        options: {
          tables,
          text,
        },
        signal: abortController.signal,
      })
      setExtractions((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'success', data: result } : e)))
    } catch (err: any) {
      // Don't update state if the request was aborted
      if (err.name === 'AbortError') {
        return
      }
      setExtractions((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'error', error: err.message } : e)))
    }
  }

  const handleDelete = (id: string) => {
    setExtractions((prev) => {
      const extraction = prev.find((e) => e.id === id)

      // If the extraction is still pending, abort the request
      if (extraction?.status === 'pending' && extraction.abortController) {
        extraction.abortController.abort()
      }

      const filtered = prev.filter((e) => e.id !== id)
      // If we deleted the active tab, switch to the first available one
      if (activeTab === id && filtered.length > 0) {
        setActiveTab(filtered[0].id)
      }
      return filtered
    })
  }

  const handleShowInfo = (extraction: Extraction) => {
    setSelectedExtraction(extraction)
    setInfoDialogOpen(true)
  }

  return (
    <>
      <div className={isExpanded ? 'w-full' : 'grid gap-6 lg:grid-cols-2'}>
        {!isExpanded && (
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='space-y-2'>
                  <Label>Extraction Tool</Label>
                  <div className='flex flex-wrap gap-2'>
                    {(['spacy', 'plumber', 'docling'] as Tool[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTool(t)}
                        className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                          tool === t
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-input hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='space-y-4'>
                  <Label>Options</Label>
                  <div className='flex flex-col gap-4'>
                    <div className='flex items-center space-x-2'>
                      <Switch
                        id='processOutput'
                        defaultChecked
                        disabled
                      />
                      <Label
                        htmlFor='processOutput'
                        className='font-normal'
                      >
                        Process Output
                      </Label>
                    </div>

                    <div className='flex items-center space-x-2'>
                      <Switch
                        id='tables'
                        checked={tables}
                        onCheckedChange={setTables}
                      />
                      <Label
                        htmlFor='tables'
                        className='font-normal'
                      >
                        Extract Tables
                      </Label>
                    </div>

                    <div className='flex items-center space-x-2'>
                      <Switch
                        id='text'
                        checked={text}
                        onCheckedChange={setText}
                      />
                      <Label
                        htmlFor='text'
                        className='font-normal'
                      >
                        Extract Text
                      </Label>
                    </div>
                  </div>
                </div>

                <div className='pt-4'>
                  <Button
                    onClick={handleSubmit}
                    className='w-full'
                    size='lg'
                    disabled={extractions.length >= MAX_EXTRACTIONS}
                  >
                    {extractions.length >= MAX_EXTRACTIONS
                      ? `Maximum ${MAX_EXTRACTIONS} extractions reached`
                      : 'Run Extraction'}
                    {extractions.length < MAX_EXTRACTIONS && <ChevronRight className='ml-2 h-4 w-4' />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>File Details</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <dl className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <dt className='text-muted-foreground font-medium'>Name</dt>
                    <dd className='truncate'>{file.name}</dd>
                  </div>
                  <div>
                    <dt className='text-muted-foreground font-medium'>Size</dt>
                    <dd>{(file.size / 1024 / 1024).toFixed(2)} MB</dd>
                  </div>
                  <div>
                    <dt className='text-muted-foreground font-medium'>Type</dt>
                    <dd>{file.type}</dd>
                  </div>
                </dl>
                {onReset && (
                  <Button
                    variant='outline'
                    className='w-full'
                    onClick={onReset}
                  >
                    <Upload className='mr-2 h-4 w-4' />
                    Choose New File
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className={`h-full ${isExpanded ? 'h-[800px]' : 'h-[500px]'}`}>
          {extractions.length === 0 ? (
            <Card className='flex h-full flex-col'>
              <CardHeader>
                <CardTitle>Results</CardTitle>
              </CardHeader>
              <CardContent className='flex-1'>
                <div className='text-muted-foreground flex h-full items-center justify-center'>
                  <p>Run extraction to see results</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='flex h-full flex-col'
            >
              <TabsList className='max-w-full justify-start overflow-x-auto border'>
                {extractions.map((extraction, index) => (
                  <TabsTrigger
                    key={extraction.id}
                    value={extraction.id}
                  >
                    {extraction.status === 'pending' ? (
                      <Shimmer duration={1}>
                        {extraction.tool.charAt(0).toUpperCase() + extraction.tool.slice(1)}
                      </Shimmer>
                    ) : (
                      <>
                        {extraction.tool.charAt(0).toUpperCase() + extraction.tool.slice(1)}
                        <span className='ml-2 text-xs'>#{extraction.id.substring(0, 3)}</span>
                      </>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              {extractions.map((extraction) => (
                <TabsContent
                  key={extraction.id}
                  value={extraction.id}
                  className='h-full flex-1'
                >
                  <Card className='flex h-full w-full flex-col'>
                    <CardHeader>
                      <CardTitle className='flex items-center justify-between'>
                        <span>Results</span>
                        <div className='flex items-center gap-2'>
                          {extraction.status === 'success' && (
                            <div className='flex items-center space-x-2'>
                              <Switch
                                id={`show-raw-${extraction.id}`}
                                checked={showRaw}
                                onCheckedChange={setShowRaw}
                              />
                              <Label
                                htmlFor={`show-raw-${extraction.id}`}
                                className='text-sm font-normal'
                              >
                                See raw
                              </Label>
                            </div>
                          )}
                          {extraction.status === 'pending' && (
                            <span className='text-muted-foreground flex items-center text-sm font-normal'>
                              <Shimmer duration={1}>Extracting...</Shimmer>
                            </span>
                          )}
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setIsExpanded(!isExpanded)}
                            className='h-8 w-8 p-0'
                          >
                            {isExpanded ? <Minimize2 className='h-4 w-4' /> : <Maximize2 className='h-4 w-4' />}
                            <span className='sr-only'>{isExpanded ? 'Minimize' : 'Expand'}</span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-8 w-8 p-0'
                              >
                                <MoreVertical className='h-4 w-4' />
                                <span className='sr-only'>Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem onClick={() => handleShowInfo(extraction)}>
                                <Info className='mr-2 h-4 w-4' />
                                Info
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant='destructive'
                                onClick={() => handleDelete(extraction.id)}
                              >
                                <Trash2 className='mr-2 h-4 w-4' />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='w-full flex-1'>
                      {extraction.status === 'error' ? (
                        <div className='bg-destructive/10 text-destructive rounded-md p-4'>
                          <p className='font-medium'>Error extracting data</p>
                          <p className='text-sm'>{extraction.error}</p>
                        </div>
                      ) : extraction.status === 'success' ? (
                        <div className='relative h-full'>
                          {showRaw ? (
                            <pre className='bg-muted h-full max-h-[600px] overflow-auto rounded-md p-4 font-mono text-xs'>
                              {JSON.stringify(extraction.data, null, 2)}
                            </pre>
                          ) : (
                            <div className='h-full max-h-[600px] overflow-auto'>
                              {extraction.data && <FormattedResults data={extraction.data} />}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className='text-muted-foreground flex h-full min-h-[500px] items-center justify-center'>
                          <Shimmer duration={1}>Extracting...</Shimmer>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>

      <Dialog
        open={infoDialogOpen}
        onOpenChange={setInfoDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extraction Information</DialogTitle>
            <DialogDescription>Details about this extraction configuration</DialogDescription>
          </DialogHeader>
          {selectedExtraction && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <dt className='text-muted-foreground font-medium'>ID</dt>
                  <dd className='font-mono'>{selectedExtraction.id}</dd>
                </div>
                <div>
                  <dt className='text-muted-foreground font-medium'>Tool</dt>
                  <dd className='capitalize'>{selectedExtraction.config.tool}</dd>
                </div>
                <div>
                  <dt className='text-muted-foreground font-medium'>Status</dt>
                  <dd className='capitalize'>{selectedExtraction.status}</dd>
                </div>
                <div>
                  <dt className='text-muted-foreground font-medium'>Created</dt>
                  <dd>{new Date(selectedExtraction.timestamp).toLocaleString()}</dd>
                </div>
              </div>
              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>Options</h4>
                <dl className='text-muted-foreground space-y-1 text-sm'>
                  <div className='flex items-center justify-between'>
                    <dt>Process Output:</dt>
                    <dd>{selectedExtraction.config.processOutput ? 'Yes' : 'No'}</dd>
                  </div>
                  <div className='flex items-center justify-between'>
                    <dt>Extract Tables:</dt>
                    <dd>{selectedExtraction.config.tables ? 'Yes' : 'No'}</dd>
                  </div>
                  <div className='flex items-center justify-between'>
                    <dt>Extract Text:</dt>
                    <dd>{selectedExtraction.config.text ? 'Yes' : 'No'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
