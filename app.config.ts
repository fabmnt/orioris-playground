import { Tool } from './app.types'

const ENDPOINTS = {
  extraction: ({ tool, processOutput }: { tool: Tool; processOutput: boolean }) =>
    new URL(`${config.API_URL}/${tool}/${processOutput ? 'process-output' : ''}`),
}

const API_URL = 'https://orioris.controlcentralcarrier.com/api/v1'

export const config = {
  API_URL,
  ENDPOINTS,
}
