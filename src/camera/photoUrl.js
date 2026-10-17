export function photoReceiverUrl(current, publicUrl = '', lanHost = '') {
  const url = new URL(publicUrl || '/', current);
  const local = host => host === 'localhost' || host.endsWith('.localhost') || host === '[::1]' || /^127\./.test(host) || host === '0.0.0.0';
  if (!publicUrl && local(url.hostname) && lanHost) url.hostname = lanHost;
  if (!['http:', 'https:'].includes(url.protocol) || local(url.hostname)) {
    throw new Error('휴대폰에서 열 수 있는 사이트 주소가 필요해요. 개발 서버를 다시 시작하거나 배포 주소를 설정해 주세요.');
  }
  url.hash = ''; url.search = '';
  return url;
}
