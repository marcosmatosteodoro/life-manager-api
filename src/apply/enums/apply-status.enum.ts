/** Status de uma candidatura (apply). */
export enum ApplyStatus {
  APPLIED = 'APPLIED', // aplicado
  REJECTED = 'REJECTED', // rejeitado
  IGNORED = 'IGNORED', // ignorado
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED', // entrevista marcada
  TECHNICAL_TEST = 'TECHNICAL_TEST', // fazendo teste técnico
  AWAITING_RESPONSE = 'AWAITING_RESPONSE', // aguardando retorno
  APPROVED = 'APPROVED', // aprovado
}
