import useGoogleSheets from 'use-google-sheets';

const GoogleSheet = () => {
  const { data, loading, error } = useGoogleSheets({
    apiKey: process.env.REACT_APP_API_KEY,
    sheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID,
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error!</div>;
  }

  return <div>{JSON.stringify(data)}</div>;
};

export default GoogleSheet;