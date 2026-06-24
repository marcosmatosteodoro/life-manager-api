/**
 * Status de um artigo (estudo). Calculado pelo back conforme os campos
 * preenchidos — o front nunca define/edita este valor.
 */
export enum ArticleStatus {
  READING_IN_PROGRESS = 'READING_IN_PROGRESS', // Leitura em progresso (default)
  SUMMARY_IN_PROGRESS = 'SUMMARY_IN_PROGRESS', // Resumo em progresso
  APPLYING_CORRECTION = 'APPLYING_CORRECTION', // Aplicando correção
  COMPLETED = 'COMPLETED', // Concluído
}
