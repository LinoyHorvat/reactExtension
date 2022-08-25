import "./Table.css";

function TableTotal({ totalTime, totalDays }) {
  return (
    <div>
      <table>
        <tbody>
          <tr className="total">
            <td className="total">Total</td>
            <td className="total">{totalDays}</td>
            <td className="total">{totalTime}</td>
            <td
              className={
                totalDays - (totalTime || 0) === 0
                  ? "orange"
                  : totalDays - (totalTime || 0) >= 0
                  ? "total"
                  : "red"
              }
            >
              {totalDays - (totalTime || 0) || 0}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default TableTotal;
