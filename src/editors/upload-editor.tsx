import React, { useState, useReducer, useContext } from 'react';
import { ISchemaComponentProps } from "components/schema-form-interfaces";
import { ValueDispatch, ValueAction } from "components/schema-form-value-context";
import { useDropzone } from "react-dropzone";
import { SchemaFormComponentWrapper } from "components/schema-form-component";
import _ from "lodash";

export interface IUploadEditorContext {
    getFileUrl(file: File, path: string[], schema: object): string;
    sendFile(url: string, file: File, progress: (pc: number) => void): Promise<void>;
}

export function sendFileAsBody(url: string, file: File, progress: (pc: number) => void) {
    return new Promise<void>((resolve, reject) => {
        try {
            const xhr = new XMLHttpRequest();
            xhr.upload.onprogress = (ev: ProgressEvent) => progress(ev.loaded / ev.total * 100.0);
            xhr.upload.onloadend = (ev: ProgressEvent) => {
                progress(xhr.status === 200 || xhr.status === 0 ? -1 : -xhr.status);
                resolve();
            }
            xhr.withCredentials = true;
            xhr.open('POST', url);
            xhr.send(file);
        } catch(err) {
            reject(err);
        }
    });
}

export const imageSpec = { extensions: [ 'jpg', 'gif', 'png', 'svg' ] };

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
    const { context, schema, path, value, errors, onFocus, onBlur } = props;
    const uploadMsg = "Drag files here or click to select";
    const uploadContext = (context || {}) as IUploadEditorContext;
    const [ progressBars, dispatchProgressBars ] = useReducer(progressBarsReducer, {});
    const [ uploaded, dispatchUploaded ] = useReducer(uploadedReducer, []);
    const dispatch = useContext(ValueDispatch);

    const updateProgress = (file: File, pc: number) => {
        dispatchProgressBars([ file.name, pc ]);
        if (pc === -1) {
            dispatchUploaded(file.name);
        }
    }

    const onDrop = (acceptedFiles: File[]) => {
        let val: string[] = [];
        const sendFilePromises = acceptedFiles.map(file => {
            const url = uploadContext.getFileUrl(file, path, schema).toLowerCase();
            return uploadContext.sendFile(url, file, (pc) => updateProgress(file, pc))
                .then(() => url);
        });
        Promise.all(sendFilePromises)
            .then((urls) => dispatch(ValueAction.set(path, urls.join('|')))); // vbar character not allowed in urls unencoded
    };

    const message = uploaded.length ? uploaded.join('; ') : uploadMsg;
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
    const urls = value ? (value as string).split('|') : [];

    const images = (urls: string[]) => {
        const imageUrls = urls.filter(url => {
            const extn = _.last(url.toLowerCase().split('.')) || '';
            return imageSpec.extensions.indexOf(extn) >= 0;
        });
        return (
        <div className="image-container">
            {imageUrls.map((url) =>
                <img key={url} className="upload-image" src={url}/>
            )}
        </div>
        );
    }

    return (
        <SchemaFormComponentWrapper {...props}>
            <div className={`sf-control sf-upload ${isDragActive ? "sf-drag-over" : ""} ${progressBars.length ? "sf-uploading" : ""}`}>
                <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    {urls.length ? images(urls)
                        : (<p className='sf-upload-message'>{message}</p>)
                    }
                </div>
                {Object.keys(progressBars).map(name => 
                    <ProgressBar pc={progressBars[name]} filename={name} key={name}/>
                )}
            </div>
        </SchemaFormComponentWrapper>
    );
}