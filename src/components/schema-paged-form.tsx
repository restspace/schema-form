import React, { useState, useEffect, useCallback, useRef } from 'react';
import SchemaForm from 'components/schema-form';
import { ISchemaFormProps } from 'components/schema-form';
import { ErrorObject } from 'error';
import { isEmpty } from 'utility';
import { emptyValue } from 'schema/schema';
import _ from "lodash";

export interface ISchemaPagedFormProps extends ISchemaFormProps {
    onSubmit?(value: object): void,
    onPage?(value: object, page: number, previousPage: number): void,
    makeNextLink(nextPage: number, onClick: (page: number) => void): React.ReactNode,
    makePreviousLink(previousPage: number, onClick: (page: number) => void): React.ReactNode,
    makeSubmitLink(onClick: () => void): React.ReactNode,
    page: number
}

export default function SchemaPagedForm(props: ISchemaPagedFormProps) {
    const pageSchema = props.schema['properties']['page' + props.page];

    const [value, setValue] = useState(props.value);
    const refValue = useRef(value);
    const [pageValue, setPageValue] = useState(props.value['page' + props.page] || emptyValue(pageSchema));
    const [errors, setErrors] = useState({} as ErrorObject);
    const [entered, setEntered] = useState(false);
    // feed value into state when props change
    useEffect(() => {
        setValue(props.value);
        const pageKey = 'page' + props.page;
        if (!props.value[pageKey]) props.value[pageKey] = emptyValue(pageSchema);
        setPageValue(props.value[pageKey]);
    }, [props.value]);

    useEffect(() => {
        setEntered(false);
        const pageKey = 'page' + props.page;
        if (!props.value[pageKey]) props.value[pageKey] = emptyValue(pageSchema);
        setPageValue(props.value[pageKey]);
    }, [props.page]);


    refValue.current = value;
    const onChange = useCallback(
    (newPageValue: object, path: string[], errors: ErrorObject) => {
        const rValue = _.cloneDeep(refValue.current);
        const newValue = { ...rValue, ['page' + props.page]: newPageValue };
        setValue(newValue);
        setPageValue(newPageValue);
        setErrors(errors);
        if (props.onChange)
            props.onChange(newValue, path, errors);
    }, [ props.onChange, props.page ]);

    function onPage(page: number) {
        setEntered(true);
        if (props.onPage && isEmpty(errors))
            props.onPage(value, page, props.page);
    }

    function onSubmit() {
        setEntered(true);
        if (props.onSubmit && isEmpty(errors))
            props.onSubmit(value);
    }

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