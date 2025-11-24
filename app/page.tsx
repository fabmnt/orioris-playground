'use client'

import { PDFResults } from '@/components/pdf-results'
import { Button } from '@/components/ui/button'
import { UploadPDF } from '@/components/upload-pdf'
import Image from 'next/image'
import { useState } from 'react'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<'upload' | 'results'>('upload')
  const handleFileSelect = (file: File) => {
    console.log('Selected file:', file.name)
    setFile(file)
    // Handle the uploaded PDF file here
  }

  const handleFileRemove = () => {
    setFile(null)
  }

  return (
    <div className='flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black'>
      <header>
        <h1 className='text-xl font-bold tracking-tight'>
          Orioris{' '}
          <Image
            className='inline-block'
            src='/oriorisai.svg'
            alt='Orioris logo'
            width={40}
            height={40}
          />
        </h1>
      </header>
      <main className='mx-auto w-full max-w-4xl space-y-6 py-4'>
        {step === 'upload' && (
          <div>
            <UploadPDF
              file={file}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
            />
          </div>
        )}
        {file && step === 'upload' && (
          <div className='flex justify-center'>
            <Button
              size='lg'
              className='h-16 w-48 text-lg'
              onClick={() => setStep('results')}
            >
              Analyze
            </Button>
          </div>
        )}
        {step === 'results' && file && <PDFResults file={file} />}
      </main>
    </div>
  )
}
