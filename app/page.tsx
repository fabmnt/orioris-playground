import { Playground } from '@/components/playground'
import Image from 'next/image'

export default function Home() {
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
      <main className='mx-auto w-full max-w-4xl py-4'>
        <Playground />
      </main>
    </div>
  )
}
