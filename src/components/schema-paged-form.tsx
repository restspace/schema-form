import React, { useState, useEffect } from 'react';
import SchemaForm from 'components/schema-form';
import { ISchemaFormProps } from 'components/schema-form';
import { ErrorObject } from 'error';
import { isEmpty } from 'utility';

export interface ISchemaPagedFormProps extends ISchemaFormProps {
    onSubmit?(value: object): void,
    onPage?(value: object, page: number): void,
    makeNextLink(nextPage: number, onClick: (page: number) => void): React.ReactNode,
    makePreviousLink(previousPage: number, onClick: (page: number) => void): React.ReactNode,
    makeSubmitLink(onClick: () => void): React.ReactNode,
    page: number
}

export default function SchemaPagedForm(props: ISchemaPagedFormProps) {
    const [value, setValue] = useState(props.value);
    const [pageValue, setPageValue] = useState(props.value['page' + props.page]);
    const [errors, setErrors] = useState({} as ErrorObject);
    const [entered, setEntered] = useState(false);
    // feed value into state when props change
    useEffect(() => {
        setValue(props.value);
        setPageValue(props.value['page' + props.page]);
    }, [props.value]);

    useEffect(() => {
        setEntered(false);
        setPageValue(props.value['page' + props.page]);
    }, [props.page]);


    function onChange(newPageValue: object, path: string[], errors: ErrorObject) {
        const newValue = { ...value, ['page' + props.page]: newPageValue };
        setValue(newValue);
        setPageValue(newPageValue);
        setErrors(errors);
        if (props.onChange)
            props.onChange(newValue, path, errors);
    }

    function onPage(page: number) {
        setEntered(true);
        if (props.onPage && isEmpty(errors))
            props.onPage(value, page);
    }

    function onSubmit() {
        setEntered(true);
        if (props.onSubmit && isEmpty(errors))
            props.onSubmit(value);
    }

    const pageSchema = props.schema['properties']['page' + props.page];
    const pageLast = Object.keys(props.schema['properties']).reduce((currCount, key) => {
        let val = 0;
        if (key.substr(0, 4) === 'page') val = parseInt(key.substr(4));
        return val > currCount ? val : currCount;
    }, 0);

    const hasLeft = props.page > 0;
    const hasRight = props.page < pageLast;

    return (
        <form className="sf-submit-form">
            <SchemaForm {...props} value={pageValue} schema={pageSchema} onChange={onChange} showErrors={entered}/>
            <div className="sf-buttons">
                <div className={hasLeft ? "sf-pager sf-left-pager" : "sf-pager sf-no-button"}>
                    {hasLeft && props.makePreviousLink(props.page - 1, onPage)}
                </div>
                <div className={hasRight ? "sf-pager sf-right-pager" : "sf-pager sf-submit-pager"}>
                    {hasRight && props.makeNextLink(props.page + 1, onPage)}
                    {!hasRight && props.makeSubmitLink(onSubmit)}
                </div>
            </div>
        </form>
    );
}