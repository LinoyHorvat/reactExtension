import React from "react";
import "./Input.css";

const Input = ({ value, handleChange, assign, colName, index, className }) => {
    const onChange = (e) => {
        handleChange(e, assign, colName, index);
    };
    return (
        <div>
            <input type="number" onChange={onChange} value={value} className={className} />
        </div>
    );
};
export default Input;