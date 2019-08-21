import React from 'react';
import { ISchemaFormProps } from 'components/schema-form';
export interface ISchemaSubmitFormProps extends ISchemaFormProps {
    onSubmit?(value: object): void;
    makeSubmitLink(onClick: () => void): React.ReactNode;
}
export default function SchemaSubmitForm(props: ISchemaSubmitFormProps): JSX.Element;
