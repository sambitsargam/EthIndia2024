import '@/styles/globals.css';

import { HuddleClient, HuddleProvider } from '@huddle01/react';

const huddleClient = new HuddleClient({
  projectId: 'pi_seBtbjhGR4YWitWt',
  options: {
    activeSpeakers: {
      size: 8,
    },
  },
});

export default function App({ Component, pageProps }) {
  return (
    <HuddleProvider client={huddleClient}>
      <Component {...pageProps} />
    </HuddleProvider>
  );
}
