import React from 'react';
import { ISchemaFormProps } from 'components/schema-form';
export interface ISchemaPagedFormProps extends ISchemaFormProps {
    onSubmit?(value: object, page: number): void;
    onPage?(value: object, page: number, previousPage: number): void;
    makeNextLink(nextPage: number, onClick: (page: number) => void): React.ReactNode;
    makePreviousLink(previousPage: number, onClick: (page: number) => void): React.ReactNode;
    makeSubmitLink(onClick: () => void): React.ReactNode;
    page: number;
}
export default function SchemaPagedForm(props: ISchemaPagedFormProps): JSX.Element;
