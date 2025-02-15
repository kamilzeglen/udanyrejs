export const generatePdfLink = (url: string): string => {
  const regex = /rejs\/(\d+)_.*?_(\d+)(?:\?|$)/;
  const match = url.match(regex);

  if (!match?.[1] || !match?.[2]) {
    throw new Error("Could not extract itineraryId and scheduleId from URL");
  }

  return `https://rejsy4you.pl/api/Itineraries/offerPdf?itineraryId=${match[1]}&scheduleId=${match[2]}&agentCode=UR92JS`;
};
