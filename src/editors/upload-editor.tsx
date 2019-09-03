import React, { useState, useReducer } from 'react';
import { ISchemaComponentProps } from "components/schema-form-interfaces"
import { useDropzone } from "react-dropzone";
import { SchemaFormComponentWrapper } from "components/schema-form-component";

export interface IUploadEditorContext {
    getFileUrl(file: File, path: string[], schema: object): string;
    sendFile(url: string, file: File, progress: (pc: number) => void): Promise<void>;
}

export function sendFileAsBody(url: string, file: File, progress: (pc: number) => void) {
    return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (ev: ProgressEvent) => progress(ev.loaded / ev.total * 100.0);
        xhr.upload.onloadend = (ev: ProgressEvent) => { progress(xhr.status === 200 || xhr.status === 0 ? -1 : -xhr.status); resolve(); }
        xhr.open('POST', url);
        xhr.send(file);
    });
}

interface IProgressBarProps {
    filename: string;
    pc: number;
}
function ProgressBar({ pc, filename }: IProgressBarProps) {
    return (
        <div className="sf-progress">
            <div className="sf-progress-indicator" style={{ width: `${pc}%` }}></div>
            <span className="sf-progress-name">{filename}</span>
        </div>
    );
}

function progressBarsReducer(state: { [key: string]: number }, action: [ string, number ]) {
    const [ filename, progress ] = action;
    if (progress < 0) {
        delete state[filename];
        return state;
    } else {
        return { ...state, [filename]: progress }
    }
}

function uploadedReducer(state: string[], action: string) {
    return [ ...state, action ];
}

export function UploadEditor(props: ISchemaComponentProps) {
    const { context, schema, path } = props;
    const uploadMsg = "Drag files here or click to select";
    const uploadContext = (context || {}) as IUploadEditorContext;
    const [ progressBars, dispatchProgressBars ] = useReducer(progressBarsReducer, {});
    const [ uploaded, dispatchUploaded ] = useReducer(uploadedReducer, []);

    const updateProgress = (file: File, pc: number) => {
        dispatchProgressBars([ file.name, pc ]);
        if (pc === -1) {
            dispatchUploaded(file.name);
        }
    }

    const onDrop = (acceptedFiles: File[]) => {
        acceptedFiles.forEach(file => {
            const url = uploadContext.getFileUrl(file, path, schema);
            uploadContext.sendFile(url, file, (pc) => updateProgress(file, pc))
                .then(() => { console.log('Uploaded ' + url); })
        });
    };

    const message = uploaded.length ? uploaded.join('; ') : uploadMsg;
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <SchemaFormComponentWrapper {...props}>
            <div className={`sf-control sf-upload ${isDragActive ? "sf-drag-over" : ""} ${progressBars.length ? "sf-uploading" : ""}`}>
                <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <p className='sf-upload-message'>{message}</p>
                </div>
                {Object.keys(progressBars).map(name => 
                    <ProgressBar pc={progressBars[name]} filename={name} key={name}/>
                )}
            </div>
        </SchemaFormComponentWrapper>
    );
}