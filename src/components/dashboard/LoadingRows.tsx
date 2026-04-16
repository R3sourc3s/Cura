export default function LoadingRows({
  rows = 5,
  cols = 4
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-6 py-4">
              <div
                className="h-4 bg-gray-200 rounded-lg animate-pulse"
                style={{
                  width: j === 0 ? "140px" : j === cols - 1 ? "60px" : "80px"
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
