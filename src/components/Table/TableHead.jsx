import React from "react";
import "./Table.css";

function TableHead() {
    return (
        <div>
            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Days-Total</th>
                    <th>Time</th>
                    <th>Remaining</th>
                </tr>
                </thead>
            </table>
        </div>
    );
}

export default TableHead;