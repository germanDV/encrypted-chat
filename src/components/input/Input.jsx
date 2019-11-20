import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './input.css';

const Input = (props) => {
    const [value, setValue] = useState('');

    const submitHandler = (ev) => {
        ev.preventDefault();
        if(value.trim()){
            props.onSubmit(value);
            setValue('');
        }
    };

    return (
        <form
            className='input__form'
            onSubmit={submitHandler}
        >
            <input
                type='text'
                placeholder='> message'
                value={value}
                onChange={ev => setValue(ev.target.value)}
            />
        </form>
    );
};

Input.propTypes = {
    onSubmit: PropTypes.func.isRequired,
};

export default Input;