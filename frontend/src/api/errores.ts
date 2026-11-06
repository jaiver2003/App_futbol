import axios from 'axios'

export function mensajeDeError(err: unknown, porDefecto = 'Ocurrió un error'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data
    if (data?.errores?.length) {
      return data.errores
        .map((e: { campo: string; mensaje: string }) => `${e.campo}: ${e.mensaje}`)
        .join('\n')
    }
    if (data?.mensaje) return data.mensaje
    if (!err.response) return 'No se pudo conectar con el servidor'
  }
  return porDefecto
}