import React from 'react';
import { ISchemaFormProps } from 'components/schema-form';
import { ErrorObject } from 'error';
export interface ISchemaSubmitFormProps extends ISchemaFormProps {
    onSubmit?(value: object): Promise<boolean>;
    onSubmitError?(value: object, error: ErrorObject): void;
    makeSubmitLink(onClick: () => void): React.ReactNode;
    onDirty?(isDirty: boolean): void;
}
export default function SchemaSubmitForm(props: ISchemaSubmitFormProps): JSX.Element;
