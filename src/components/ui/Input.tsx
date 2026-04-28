import React from "react";

//Propiedades de los inputs
type InputProps = {
    label: string;
    type: string;
    placeholder?: string;
    minLength?: number;
    value?: string;
    inputMode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'search' | 'email' | 'url';
    pattern?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};
//Función input/componente
export function Input({ 
    label, 
    type, 
    placeholder, 
    minLength, 
    value, 
    inputMode, 
    pattern, 
    onChange, 
    onKeyPress 
}: InputProps) {
    //Asignar el id del label al input
    const id = label.toLowerCase().replace(/\s+/g, '-');
    return (
        //Estructura del input
        <div className="flex flex-col">
            <label htmlFor={id} className="text-lg font-medium text-gray-700 mb-1">{label}</label>
            <input 
                id={id} 
                type={type} 
                value={value}
                placeholder={placeholder} 
                minLength={minLength} 
                inputMode={inputMode}
                pattern={pattern}
                onChange={onChange}
                onKeyPress={onKeyPress}
                required 
                className="border-2 border-gray-300 rounded-lg outline-none px-3 py-2 focus:border-[var(--Primary_5)] focus:ring-2 focus:ring-[var(--Primary_2)] transition-colors duration-200" 
            />
        </div>
    )
}
