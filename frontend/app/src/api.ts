async function chamarApi(caminho: string, opcoes?: RequestInit) {
  const res = await fetch(caminho, opcoes)
  if (!res.ok) throw new Error(`API respondeu ${res.status}`)
  return res.json()
}

export const listarObras = () => chamarApi('/api/works')