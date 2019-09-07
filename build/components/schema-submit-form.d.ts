import React from 'react';
import { ISchemaFormProps } from 'components/schema-form';
export interface ISchemaSubmitFormProps extends ISchemaFormProps {
    onSubmit?(value: object): Promise<boolean>;
    makeSubmitLink(onClick: () => void): React.ReactNode;
    onDirty?(isDirty: boolean): void;
}
export default function SchemaSubmitForm(props: ISchemaSubmitFormProps): JSX.Element;
