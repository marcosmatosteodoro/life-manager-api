import { del, get, put } from '@vercel/blob';

/**
 * Armazenamento de fotos de **perfil** (único por dono) no Vercel Blob privado.
 * O Postgres guarda só a referência (pathname/url); a leitura passa pelo back
 * autenticado — o binário nunca fica exposto por URL pública. Compartilhado
 * entre `dog` e `user` para não duplicar a integração com o Blob.
 */
export interface StoredPhoto {
  pathname: string;
  url: string;
}

/** Sobe a imagem (base64) para o Blob privado e devolve pathname/url. */
export async function putProfilePhoto(
  prefix: string,
  id: number,
  data: string,
  mimeType: string,
): Promise<StoredPhoto> {
  const ext = mimeType.split('/')[1]?.replace(/[^\w]/g, '') || 'bin';
  const buffer = Buffer.from(data, 'base64');
  const blob = await put(`${prefix}/${id}/photo.${ext}`, buffer, {
    access: 'private',
    contentType: mimeType,
    addRandomSuffix: true,
  });
  return { pathname: blob.pathname, url: blob.url };
}

/** Lê um blob privado e devolve o conteúdo em base64 (ou '' se sumiu). */
export async function readProfilePhotoBase64(
  pathname: string,
): Promise<string> {
  const result = await get(pathname, { access: 'private' });
  if (!result?.stream) return '';
  const buffer = Buffer.from(await new Response(result.stream).arrayBuffer());
  return buffer.toString('base64');
}

/** Apaga o blob; ignora se ele já não existir (deleção idempotente). */
export async function delProfilePhoto(url: string): Promise<void> {
  await del(url).catch(() => undefined);
}
