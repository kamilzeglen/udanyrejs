export const formatDate = (inputDate: string): string => {
  const monthMap: Record<string, string> = {
    "STYCZEŃ": "01",
    "LUTY": "02",
    "MARZEC": "03",
    "KWIECIEŃ": "04",
    "MAJ": "05",
    "CZERWIEC": "06",
    "LIPIEC": "07",
    "SIERPIEŃ": "08",
    "WRZESIEŃ": "09",
    "PAŹDZIERNIK": "10",
    "LISTOPAD": "11",
    "GRUDZIEŃ": "12",
  };

  const parts = inputDate.split("\n");
  if (parts.length !== 3) throw new Error("Invalid date format");

  const [day, monthName, year] = parts.map(p => p.trim());
  const month = monthMap[monthName.toUpperCase()];

  if (!month) throw new Error("Invalid month name");

  return `${year}-${month}-${day.padStart(2, "0")}`;
};
