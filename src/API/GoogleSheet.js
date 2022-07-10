import useGoogleSheets from 'use-google-sheets';

const GoogleSheet = (props) => {
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

  props.setItemInfo(JSON.stringify(data));
  return ;
};

export default GoogleSheet;