/// <reference path="../typings/knockout/knockout.d.ts" />

module df.bindingHandlers {

    ko.bindingHandlers['multiselect'] = {
        init: (element: HTMLElement, valueAccessor:() => any, allBindings: KnockoutAllBindingsAccessor, viewModel: any) => {
            var $element = $(element),
                value = allBindings().multiselectvalue,
                optsText = allBindings().optionsText,
                optsValue = allBindings().optionsValue,
                optsLocked = allBindings().optionsLocked;

            $element.select2({
                multiple: true,
                query: args => {
                    var items = ko.unwrap(valueAccessor()),
                        results = [];

                    args.callback({ results: results });
                }
            }).change(() => {
                var newData = $element.select2('data');
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
        },
        transformValues: function (items) {

        }
    };

}