import React, { useEffect, useRef } from 'react';
import flex from '@course/styles';
import cx from '@course/cx';

export type TCheckboxItem = {
    id: string;
    label: string;
    parent?: TCheckboxItem;
    selected?: boolean;
    indeterminate?: boolean;
    children?: TCheckboxItem[];
}

type TCheckboxTreeState = Record<string, TCheckboxItem>;


function process(acc: Record<string, TCheckboxItem>, item: TCheckboxItem, parent?: TCheckboxItem) {
    acc[item.id] = item;
    item.parent = parent;
    item.selected = item.selected || !!parent?.selected;

    item.children?.forEach(child => process(acc, child, item));

    if (item.children?.length) {
        const allChecked = item.children.every(it => it.selected);
        const someChecked = item.children.some(it => it.selected || it.indeterminate);

        item.selected = allChecked;
        item.indeterminate = !allChecked && someChecked;
    }

    return acc;
}


function propagate(children: TCheckboxItem[], value: boolean) {
    for (const child of children) {
        child.selected = value;
        child.indeterminate = false;
        propagate(child.children ?? [], value)
    }
}

function bubble(
    state: TCheckboxTreeState,
    target: TCheckboxItem,
) {
    if (target == null || target?.parent == null) return;
    const parent = target?.parent;

    const children = parent.children ?? [];
    const allChecked = children.every(it => it.selected);
    const someChecked = children.some(it => it.selected || it.indeterminate);

    parent.selected = allChecked;
    parent.indeterminate = !allChecked && someChecked;

    bubble(state, parent)
}

export const CheckboxTree = ({ items }: { items: TCheckboxItem[] }) => {
    const [state, setState] = React.useState<TCheckboxTreeState>({});

    useEffect(() => {
        const clonedItems = structuredClone(items);
        const state = clonedItems.reduce((acc, next) => process(acc, next, undefined), {} as Record<string, TCheckboxItem>)
        setState(state);
    }, [items]);


    const onSelect: React.FormEventHandler<HTMLUListElement> = ({ target }) => {
        if (!(target instanceof HTMLInputElement)) {
            return;
        }
        const { id } = target.dataset;
        if (id == null) {
            return;
        }
        const newState = structuredClone(state);
        const element = newState[id];

        if (element != null) {
            element.selected = target.checked;
            element.indeterminate = false;
            const children = newState[id]?.children ?? [];
            propagate(children, target.checked);
            bubble(newState, element);
            setState(newState);
        }
    }

    return (
        <ul onChangeCapture={onSelect}>
            {Object.values(state)
                .filter((item) => !item.parent)
                .map((item) => (
                    <li key={item.id}>
                        <Checkbox {...item} />
                    </li>
                ))}
        </ul>
    );
};

function Checkbox({ label, children, id, selected, indeterminate }: TCheckboxItem) {
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = indeterminate ?? false;
        }
    }, [indeterminate]);

    return (
        <>
            <label>
                <input
                    ref={ref}
                    checked={selected ?? false}
                    data-id={id}
                    id={id}
                    type="checkbox"
                    readOnly
                />
                <span className={cx(flex.paddingLeft8)}>{label}</span>
            </label>
            {children && children.length > 0 && (
                <ul className={cx(flex.paddingLeft16)}>
                    {children.map((item) => (
                        <li key={item.id}>
                            <Checkbox {...item} />
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
