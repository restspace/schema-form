import React, { FunctionComponent, useContext, useImperativeHandle, useState } from "react";
import { ISchemaComponentProps } from "./schema-form-interfaces";
import { fieldType } from "../schema/schema";
import { ValueDispatch, ValueAction } from "./schema-form-value-context";
import { browserInfo } from "../utility";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

export const SchemaFormComponentWrapper: FunctionComponent<ISchemaComponentProps> = ({ errors, caption, children, schema, isRequired, context }) => {
    const isError = errors.length > 0;
    const errorClass = isError ? "sf-has-error " : "";
    const requiredClass = isRequired ? "sf-required " : ""
    const outerClass = schema['className'] ? "sf-row " + schema['className'] : "sf-row";
    const outerErrorClass = schema['className'] ? "sf-row sf-error-row " + schema["className"] + "-error" : "sf-row sf-error-row";
    const gridMode = context && context['gridMode'];
    const innerClass = gridMode && schema['className'] ? schema["className"] + ' ' : '';

    const mainField = () => (
        <>
            {caption && <label className={"sf-caption " + errorClass + requiredClass + innerClass}>
                {caption}
                {schema['description'] && (<><br/><span className={"sf-description " + errorClass}>
                    {schema['description']}
                </span></>)}
            </label>}
            {children}
        </>
    );

    const errorField = () => (
        <>
            <label className="sf-caption"></label>
            {errors.map((err, idx) => (
                <span key={idx} className="sf-error">{err.message}</span>
            ))}
        </>
    );

    return (
    <>
        {gridMode
            ? mainField()
            : <div className={outerClass}>
                {mainField()}
            </div>
        }
        {isError && (gridMode
            ? errorField()
            : <div className={outerErrorClass}>
                {errorField()}
            </div>
        )}
    </>
    );
}

interface StringFilter {
    toStore(uiVal: string): any;
    toUi(storeVal: any): string;
}

const stringFilters: { [key: string]: StringFilter } = {
    "html-newlines": {
        toStore: (uiVal) => uiVal.replace(/\n/g, '<br/>'),
        toUi: (storeVal) => storeVal.replace(/<br\/>/g, '\n')
    }
};

export function SchemaFormComponent(props: ISchemaComponentProps): React.ReactElement {
    const {
        schema,
        path,
        value,
        errors,
        onFocus,
        onBlur,
        context,
        isRequired
    } = props;
    const name = path.join('.');
    const dispatch = useContext(ValueDispatch);
    const [ holdString, setHoldString ] = useState('');

    let formatCurrency = context && context['formatCurrency'];
    const currencySymbol = (context && context['currencySymbol']) || '$';
    if (!formatCurrency) formatCurrency = (value?: number) => {
        if (!value && value !== 0) return '';
        return value === Math.round(value) ? `${currencySymbol}${value}` : `${currencySymbol}${value.toFixed(2)}`;
    }

    function handleChange(ev: React.FormEvent) {
        const val = ev.target['value'] as string;
        dispatch(ValueAction.set(path, val));
    }

    function handleTextChange(ev: React.FormEvent) {
        let val = ev.target['value'];
        if (schema['filter']) {
            val = stringFilters[schema['filter'] as string].toStore(val);
        }
        dispatch(ValueAction.set(path, val));
    }

    function uiValue(storeVal: any): string {
        return schema['filter']
            ? (storeVal ? stringFilters[schema['filter']].toUi(storeVal) : '')
            : (storeVal || '').toString();
    }

    function handleDateTimeChange(ev: React.FormEvent) {
        if (!ev.target['validity'].valid) return;
        const val = ev.target['value'] + ':00Z';
        dispatch(ValueAction.set(path, val));
    }

    function handleTextDateTimeChange(ev: React.FormEvent) {
        const str = ev.target['value'] as string;
        if (str === '') {
            setHoldString('');
            dispatch(ValueAction.set(path, null));
        } else {
            const dt = dayjs(str, [
                "YYYY-MM-DD HH:mm:ss",
                "YYYY-MM-DD HH:mm",
                "YYYY-MM-DD"
            ], true);
            setHoldString(str);
            if (!dt.isValid()) return;
            const newStr = dt.utc().format();
            console.log('ch d val ' + newStr);
            dispatch(ValueAction.set(path, newStr));
        }
    }

    function handleChangeNumber(ev: React.FormEvent) {
        const str = ev.target['value'] as string;
        if (str === '')
            dispatch(ValueAction.set(path, null));
        else { 
            const num = parseFloat(str);
            if (!isNaN(num)) {
                dispatch(ValueAction.set(path, num));
            }
        }
    }

    function handleCurrencyChange(ev: React.FormEvent) {
        let str = ev.target['value'] as string;
        if (str === '' || str == currencySymbol) {
            setHoldString('');
            dispatch(ValueAction.set(path, null));
        } else {
            const numStr = str.replace(currencySymbol, '');
            const num = parseFloat(numStr);
            const fmt = formatCurrency(num);
            const fmtNoSymbol = fmt.replace(currencySymbol, '');
            setHoldString(fmt === str || fmtNoSymbol === str ? '' : str);
            if (!isNaN(num)) {
                dispatch(ValueAction.set(path, num));
            }
        }
    }

    function handleCheckChange(ev: React.ChangeEvent) {
        dispatch(ValueAction.set(path, ev.target['checked']));
    }

    function handleFocus() {
        onFocus(path);
    }

    function handleBlur() {
        onBlur(path);
    }

    function handleHeldBlur() {
        if (!value && holdString) dispatch(ValueAction.set(path, holdString));
        setHoldString('');
        handleBlur();
    }

    function schemaInput(isError: boolean) {
        const classes = (specific: string) => `sf-control ${specific} ${isError && 'sf-has-error'}`;
        const readOnly = schema['readOnly'] || false;
        const baseProps = { name, readOnly, id: name, onFocus: handleFocus, onBlur: handleBlur };
        const commonProps = { ...baseProps, value: (value || '').toString(), onChange: () => {}, onInput: handleChange };
        const selectProps = { ...baseProps, value: (value || '').toString(), onChange: handleChange, disabled: baseProps.readOnly };

        switch (fieldType(schema)) {
            case "null":
                return <></>;
            case "string":
                return (<input {...commonProps} value={uiValue(value)} onInput={handleTextChange} type="text" className={classes("sf-string")} />)
            case "boolean":
                return (<input {...baseProps} type="checkbox" checked={(value || false) as boolean} className={classes("sf-boolean sf-checkbox")} onChange={handleCheckChange} />)
            case "number":
                return (<input {...commonProps} type="number" className={classes("sf-number")} onInput={handleChangeNumber} />)
            case "currency":
                const currencyProps = { ...baseProps, value: holdString ? holdString : formatCurrency(value), onChange: () => {}, onInput: handleCurrencyChange };
                console.log('hold string:::' + holdString);
                return (<input {...currencyProps} type="text" className={classes("sf-currency")} />)
            case "date":
                return (<input {...commonProps} type="date" className={classes("sf-date")} />)
            case "date-time":
                if (browserInfo.isIE || browserInfo.isSafari || browserInfo.isFirefox) {
                    const val = holdString || (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '');
                    const textDateTimeProps = { ...baseProps, value: val, onChange: () => {}, onInput: handleTextDateTimeChange, onBlur: handleHeldBlur };
                    return (<input {...textDateTimeProps } type="text" className={classes("sf-datetime")} placeholder="e.g. 2000-11-22 15:33:44" />);
                } else if (false) {
                    return (<></>);
                } else {
                    const dateTimeProps = { ...baseProps, value: (value || '').toString().substring(0, 16), onChange: () => {}, onInput: handleDateTimeChange };
                    return (<input {...dateTimeProps} type="datetime-local" className={classes("sf-datetime")} />);
                }
            case "email":
                return (<input {...commonProps} type="email" className={classes("sf-email")} />)
            case "password":
                return (<input {...commonProps} type="password" className={classes("sf-password")} />)
            case "hidden":
                return (<input {...commonProps} type="hidden" className="sf-hidden" />)
            case "textarea":
                return (<textarea {...commonProps} value={uiValue(value)} onInput={handleTextChange} className={classes("sf-textarea")} />)
            case "enum":
                return (
                <select {...selectProps} className={classes("sf-enum")}>
                    <option key='' value=''></option>
                    {schema['enum'].map((val: string, idx: number) =>
                        (<option key={val || idx} value={val}>{val}</option>))}
                </select>
                )
        }
        return (<div>No such type</div>)
    }

    const isError = errors.length > 0;
    return (
        <SchemaFormComponentWrapper {...props}>
            {schemaInput(isError)}
        </SchemaFormComponentWrapper>
    );
}