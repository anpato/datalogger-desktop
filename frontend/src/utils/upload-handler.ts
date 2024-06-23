export function uploadHandler(jsonData: { [key: string]: any }[]) {
  if (jsonData.length) {
    const headers = Object.keys(jsonData[0]);
    console.log(headers);
    return {
      headers,
      records: jsonData.map((d) => {
        headers.forEach((k) => {
          d[k] = d[k].includes('.') ? parseFloat(d[k]) : parseInt(d[k]);
        });
        return d;
      })
    };
  }
  return {
    headers: [] as string[],
    records: []
  };
}
