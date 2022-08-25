import "./Table.css";
import Input from "../Input/Input";
import { useEffect } from "react";

const Table = ({
  data,
  handleChange,
  assign,
  index,
  dataFromJira,
  refreshPage,
}) => {
  useEffect(() => {}, [refreshPage]);
  return (
    <div className="container">
      <table>
        <tbody>
          <tr className={assign === "Unassigned" ? "unassigned" : ""}>
            <td className={assign === "Unassigned" ? "unassigned" : "name"}>
              {assign}
            </td>
            <td>
              <Input
                value={data.daysTotal}
                handleChange={handleChange}
                assign={assign}
                index={index}
                colName={"daysTotal"}
                className={assign === "Unassigned" ? "unassigned_input" : ""}
              />
            </td>
            <td className={assign === "Unassigned" ? "unassigned" : ""}>
              {dataFromJira.time || 0}
            </td>
            <td
              className={
                data.daysTotal - (dataFromJira.time || 0) === 0
                  ? "orange"
                  : data.daysTotal - (dataFromJira.time || 0) >= 0
                  ? "green"
                  : "red"
              }
            >
              {data.daysTotal - (dataFromJira.time || 0) || 0}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
export default Table;
