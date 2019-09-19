import React, { useState, useEffect, useCallback, useRef } from 'react';
import SchemaForm from 'components/schema-form';
import { ISchemaFormProps } from 'components/schema-form';
import { ErrorObject, validate } from 'error';
import { isEmpty } from 'utility';
import { emptyValue } from 'schema/schema';
import _ from "lodash";

export interface ISchemaPagedFormProps extends ISchemaFormProps {
    onSubmit?(value: object, page: number): void,
    onPage?(value: object, page: number, previousPage: number): void,
    makeNextLink(nextPage: number, onClick: (page: number) => void): React.ReactNode,
    makePreviousLink(previousPage: number, onClick: (page: number) => void): React.ReactNode,
    makeSubmitLink(onClick: () => void): React.ReactNode,
    page: number
}

export default function SchemaPagedForm(props: ISchemaPagedFormProps) {
    const pageSchema = props.schema['properties']['page' + props.page];
    const [value, setValue] = useState(props.value);
    const refLastPropsValue = useRef(props.value);
    const refValue = useRef(value);
    const [pageValue, setPageValue] = useState(props.value['page' + props.page] || {});
    const [entered, setEntered] = useState(false);

    // feed value into state when props change
    useEffect(() => {
        if (!_.isEqual(props.value, refLastPropsValue.current)) {
            setValue(props.value);
            const pageKey = 'page' + props.page;
            if (!props.value[pageKey]) props.value[pageKey] = {};
            refValue.current = props.value;
            setPageValue(props.value[pageKey]);
        }
        refLastPropsValue.current = props.value;
    }, [props.value, refLastPropsValue, props.page]);

    useEffect(() => {
        setEntered(false);
        const pageKey = 'page' + props.page;
        if (!props.value[pageKey]) props.value[pageKey] = {};
        setPageValue(props.value[pageKey]);
    }, [props.page]);

    // if (!pageSchema) return (
    //     <></>
    // );

    const onChange = useCallback(
    (newPageValue: object, path: string[], errors: ErrorObject) => {
        const rValue = _.cloneDeep(refValue.current);
        const newValue = { ...rValue, ['page' + props.page]: newPageValue };
        setValue(newValue);
        setPageValue(newPageValue);
        if (props.onChange)
            props.onChange(_.cloneDeep(newValue), path, errors);
        refValue.current = newValue;
    }, [ props.onChange, props.page, refValue ]);

    function onPage(page: number) {
        setEntered(true);
        const pageKey = 'page' + props.page;
        const errors = validate(props.schema['properties'][pageKey], value[pageKey]);
        if (props.onPage && isEmpty(errors))
            props.onPage(value, page, props.page);
    }

    function onSubmit() {
        setEntered(true);
        const errors = validate(props.schema, value);
        if (props.onSubmit && isEmpty(errors)) {
            props.onSubmit(value, props.page);
        } else if (props.onSubmit) {
            console.log('+ Blocked page change from error:');
            console.log(JSON.parse(JSON.stringify(errors)));
        }
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