/// <reference types="react" />
import { ISchemaFormProps } from 'components/schema-form';
export interface ISchemaSubmitFormProps extends ISchemaFormProps {
    onSubmit?(value: object): void;
    submitLabel?: string;
}
export default function SchemaSubmitForm(props: ISchemaSubmitFormProps): JSX.Element;
