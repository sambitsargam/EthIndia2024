export default function Home() {
  return <></>;
}

export const getServerSideProps = async () => {
  const response = await fetch('https://api.huddle01.com/api/v1/create-room', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Huddle01 Room',
    }),
    headers: {
      'Content-type': 'application/json',
      'x-api-key': "ak_Vemhe2aX5N5w382v",
    },
  });

  const data = await response.json();
  const roomId = data.data.roomId;

  return {
    redirect: {
      destination: `/${roomId}`,
      permanent: false,
    },
  };
};
