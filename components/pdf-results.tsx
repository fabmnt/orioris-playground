'use client'

import { Tool } from '@/app.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { extractionService } from '@/services/extraction-service'
import { useMutation } from '@tanstack/react-query'
import { Check, ChevronRight, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface PDFResultsProps {
  file: File
}

export function PDFResults({ file }: PDFResultsProps) {
  const [tool, setTool] = useState<Tool>('spacy')
  const [processOutput, setProcessOutput] = useState(true)
  const [tables, setTables] = useState(true)
  const [text, setText] = useState(true)

  const {
    mutate: extract,
    data,
    isPending,
    error,
  } = useMutation({
    mutationFn: extractionService.query.extract,
  })

  const handleSubmit = () => {
    extract({
      tool,
      processOutput,
      pdf: file,
      options: {
        tables,
        text,
      },
    })
  }

  return (
    <div className='grid gap-6 lg:grid-cols-2'>
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
                    {tool === t && <Check className='h-4 w-4' />}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className='space-y-4'>
              <Label>Options</Label>
              <div className='flex flex-col gap-4'>
                <div className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    id='processOutput'
                    className='text-primary focus:ring-primary h-4 w-4 rounded border-gray-300'
                    checked={processOutput}
                    onChange={(e) => setProcessOutput(e.target.checked)}
                  />
                  <Label
                    htmlFor='processOutput'
                    className='font-normal'
                  >
                    Process Output
                  </Label>
                </div>

                <div className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    id='tables'
                    className='text-primary focus:ring-primary h-4 w-4 rounded border-gray-300'
                    checked={tables}
                    onChange={(e) => setTables(e.target.checked)}
                  />
                  <Label
                    htmlFor='tables'
                    className='font-normal'
                  >
                    Extract Tables
                  </Label>
                </div>

                <div className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    id='text'
                    className='text-primary focus:ring-primary h-4 w-4 rounded border-gray-300'
                    checked={text}
                    onChange={(e) => setText(e.target.checked)}
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
                disabled={isPending}
                className='w-full'
                size='lg'
              >
                {isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Extracting...
                  </>
                ) : (
                  <>
                    Run Extraction
                    <ChevronRight className='ml-2 h-4 w-4' />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>File Details</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      <div className='h-full min-h-[500px]'>
        <Card className='flex h-full flex-col'>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent className='flex-1'>
            {error ? (
              <div className='bg-destructive/10 text-destructive rounded-md p-4'>
                <p className='font-medium'>Error extracting data</p>
                <p className='text-sm'>{error.message}</p>
              </div>
            ) : data ? (
              <div className='relative h-full'>
                <pre className='bg-muted h-full max-h-[600px] overflow-auto rounded-md p-4 font-mono text-xs'>
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            ) : (
              <div className='text-muted-foreground flex h-full items-center justify-center'>
                <p>Run extraction to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
