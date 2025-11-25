'use client'

import { PDFResults } from '@/components/pdf-results'
import { DarkModeToggle } from '@/components/toggle-dark-mode'
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

  const handleReset = () => {
    setStep('upload')
  }

  return (
    <div className='flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black'>
      <header className='bg-card border-b py-4 pb-4'>
        <div className='mx-auto flex w-full max-w-4xl items-center justify-between xl:max-w-6xl'>
          <div>
            <h1 className='text-lg font-bold tracking-tight'>
              Orioris{' '}
              <Image
                className='inline-block'
                src='/oriorisai.svg'
                alt='Orioris logo'
                width={24}
                height={24}
              />
            </h1>
          </div>
          <div>
            <DarkModeToggle />
          </div>
        </div>
      </header>
      <main className='mx-auto w-full max-w-4xl space-y-6 py-4 xl:max-w-6xl'>
        {step === 'upload' && (
          <div className='flex flex-col gap-y-4'>
            <div>
              <h2 className='text-center text-5xl font-bold tracking-tight'>
                Welcome to Orioris{' '}
                <Image
                  src='/oriorisai.svg'
                  className='inline-block'
                  alt='Orioris logo'
                  width={80}
                  height={80}
                />
              </h2>
            </div>
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
        {step === 'results' && file && (
          <PDFResults
            file={file}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  )
}
