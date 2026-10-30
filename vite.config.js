import {networkInterfaces} from 'node:os';

export default ({command}) => {
  const addresses = Object.values(networkInterfaces()).flat().filter(item =>
    item && item.family === 'IPv4' && !item.internal && !item.address.startsWith('169.254.'));
  const lan = addresses.find(item => item.address.startsWith('192.168.')) || addresses[0];
  return {
    build: {target: ['chrome109', 'safari15.6'], cssTarget: ['chrome109', 'safari15.6']},
    server: {host: '0.0.0.0', watch: {ignored: ['**/.tmp/**']},
      proxy: {'/api/photo-ice': {target:'https://uribaram.vercel.app',changeOrigin:true}}},
    preview: {host: '0.0.0.0'},
    define: {'import.meta.env.VITE_DEV_LAN_HOST': JSON.stringify(command === 'serve' ? lan?.address || '' : '')},
  };
};
