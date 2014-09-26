/// <reference path="../typings/knockout/knockout.d.ts" />

interface ISelect2MultiSelectItem {
    id: string;
    text: string;
    data: any;
    locked?: boolean;
}

(() => {

    function toSelect2Format(items: any[], textProp, valueProp, lockedProp): ISelect2MultiSelectItem[] {
        var results = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            results.push({
                id: ko.unwrap(item[valueProp]),
                text: ko.unwrap(item[textProp]),
                locked: typeof lockedProp === 'string' ? ko.unwrap(item[lockedProp]) : false,
                data: item
            });
        }

        return results;
    }

    function fromSelect2Format(items: ISelect2MultiSelectItem[]): any[] {
        var results = [];
        for (var i = 0; i < items.length; i++) {
            results.push(items[i].data);
        }

        return results;
    }

    ko.bindingHandlers['multiselect'] = {
        init: (element: HTMLElement, valueAccessor:() => any, allBindings: KnockoutAllBindingsAccessor, viewModel: any) => {
            var $element = $(element),
                value = allBindings().multiselectvalue,
                optsText = allBindings().optionsText || 'text',
                optsValue = allBindings().optionsValue || 'id',
                optsLocked = allBindings().optionsLocked || 'locked';

            // Error checks
            if (!$element.is('input[type=hidden]')) {
                throw new Error('ko.bindingHandlers.multiselect: Can only use with an input[type=hidden]');
            }

            $element.select2({
                multiple: true,
                query: args => {
                    var items = ko.unwrap(valueAccessor()) || [],
                        results = toSelect2Format(items, optsText, optsValue, optsLocked);

                    args.callback({ results: results, more: false });
                }
            }).change(() => {
                var newData = fromSelect2Format($element.select2('data'));
                console.log(newData);
                if (ko.isObservable(value)) {
                    value(newData);
                }
            });

            if (ko.isObservable(value) && value.push) {
                value.subscribe(newValue => {

                });
            }
        },
        update: (element, valueAccessor, allBindings, viewModel) => {
            var $element = $(element),
                items = valueAccessor();

            ko.computed(() => ko.toJS(valueAccessor()))
                .subscribe(newItems => {
                    var data = $element.select2('data') || [];

                    ko.utils.arrayForEach(data, (val: any) => {
                        var match: any = null;

                        if (match) {
                            val.text = match.text;
                            val.locked = match.locked;
                        }
                    });

                    $element.select2('data', data);
                });
        }
    };
})();