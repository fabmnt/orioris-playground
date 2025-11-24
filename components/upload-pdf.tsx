'use client'

import { cn } from '@/lib/utils'
import { CheckCircle2, FileText, Upload, X } from 'lucide-react'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from './ui/button'

interface UploadPDFProps {
  onFileSelect?: (file: File) => void
  onFileRemove?: () => void
  file?: File | null
  className?: string
}

export function UploadPDF({ onFileSelect, onFileRemove, file, className }: UploadPDFProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        onFileSelect?.(file)
      }
    },
    [onFileSelect],
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    multiple: false,
  })

  const removeFile = () => {
    onFileRemove?.()
  }

  return (
    <div className={cn('w-full', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'group relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-all',
          isDragActive && !isDragReject && 'border-primary bg-primary/5 ring-primary/10 shadow-lg ring-4',
          isDragReject && 'border-destructive bg-destructive/5',
          !isDragActive && 'border-border hover:border-primary/50 hover:bg-accent/50',
          file && 'border-primary/30 bg-primary/5 border-solid',
        )}
      >
        <input {...getInputProps()} />

        {!file ? (
          <div className='flex flex-col items-center gap-4 text-center'>
            <div
              className={cn(
                'rounded-full p-4 transition-all',
                isDragActive && !isDragReject && 'bg-primary/20 shadow-lg',
                isDragReject && 'bg-destructive/20',
                !isDragActive && 'bg-muted group-hover:bg-primary/10',
              )}
            >
              <Upload
                className={cn(
                  'size-10 transition-all',
                  isDragActive && !isDragReject && 'text-primary scale-110',
                  isDragReject && 'text-destructive',
                  !isDragActive && 'text-muted-foreground group-hover:text-primary',
                )}
              />
            </div>

            <div className='space-y-2'>
              <p className='text-lg font-semibold'>
                {isDragActive && !isDragReject && 'Drop your PDF here'}
                {isDragReject && 'Only PDF files are accepted'}
                {!isDragActive && 'Drag & drop your PDF here'}
              </p>
              <p className='text-muted-foreground text-sm'>
                or click to browse files
                <br />
                <span className='text-xs'>Accepts PDF files only</span>
              </p>
            </div>
          </div>
        ) : (
          <div className='flex w-full flex-col items-center gap-4'>
            <div className='bg-background ring-border flex items-center gap-3 rounded-lg p-4 shadow-sm ring-1'>
              <div className='bg-primary/10 rounded-md p-2'>
                <FileText className='text-primary size-6' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium'>{file.name}</p>
                <p className='text-muted-foreground text-xs'>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <CheckCircle2 className='size-5 shrink-0 text-green-600' />
            </div>

            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={(e) => {
                e.stopPropagation()
                removeFile()
              }}
              className='gap-2'
            >
              <X className='size-4' />
              Remove file
            </Button>

            <p className='text-muted-foreground text-center text-xs'>Click or drag to replace with another PDF</p>
          </div>
        )}
      </div>
    </div>
  )
}
