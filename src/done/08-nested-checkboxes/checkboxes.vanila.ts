import { Component, type TComponentConfig } from "../abstract-component/component";
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

export class CheckboxTree extends Component<{ items: TCheckboxItem[] }> {

    state: Record<string, TCheckboxItem> = {};

    constructor(config: TComponentConfig<{ items: TCheckboxItem[] }>) {
        super({ ...config, listeners: ['change'] });
        this.state = this.config.items.reduce((acc, next) => process(acc, next, undefined), {} as Record<string, TCheckboxItem>)
    }

    propagate(item: TCheckboxItem, value: boolean) {
        const element = this.container!.querySelector(`[data-item-id="${item.id}"]`);
        if (element instanceof HTMLInputElement) {
            element.checked = value;
            element.indeterminate = false;
        }
        item.selected = value;
        item.indeterminate = false;
        item.children?.forEach(child => this.propagate(child, value));
    }

    bubble(item: TCheckboxItem) {
        const parent = item.parent;
        if (!parent) return;

        const parentElement = this.container!.querySelector(`[data-item-id="${parent.id}"]`);
        if (parentElement instanceof HTMLInputElement) {
            const children = parent.children || [];
            const allChecked = children.every(it => it.selected);
            const someChecked = children.some(it => it.selected || it.indeterminate);

            parent.selected = allChecked;
            parent.indeterminate = !allChecked && someChecked;

            parentElement.checked = parent.selected;
            parentElement.indeterminate = parent.indeterminate || false;

            this.bubble(parent);
        }
    }


    toHTML(): string {
        const items = Object.values(this.state).filter((item) => !item.parent);
        return this.getChildrenTemplate(items);
    }

    afterRender() {
        Object.values(this.state).forEach(item => {
            if (item.indeterminate) {
                const element = this.container!.querySelector(`[data-item-id="${item.id}"]`);
                if (element instanceof HTMLInputElement) {
                    element.indeterminate = true;
                }
            }
        });
    }

    getCheckboxTemplate = (item: TCheckboxItem): string => {
        return `
        <li>
            <label>
                <input data-item-id="${item.id}" data-parent-id="${item.parent?.id ?? ''}" type="checkbox" ${item.selected ? 'checked' : ''}>
                <span class="${cx(flex.paddingLeft8)}">${item.label}</span>
            </label>
            ${item.children?.length ? this.getChildrenTemplate(item.children) : ''}
        </li>`.trim();
    }

    getChildrenTemplate = (items: TCheckboxItem[]): string => {
        return `<ul class="${cx(flex.paddingLeft16)}">${items.map(this.getCheckboxTemplate).join('')}</ul>`;
    }

    onChange({ target }: Event) {
        if (!(target instanceof HTMLInputElement)) {
            return;
        }

        const id = target.dataset.itemId;
        if (!id) return;

        const item = this.state[id];
        if (!item) return;

        const checked = target.checked;

        this.propagate(item, checked);
        this.bubble(item);
    }

}