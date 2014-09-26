/// <reference path="../typings/jasmine/jasmine.d.ts" />
/// <reference path="../typings/jasmine-jquery/jasmine-jquery.d.ts" />

module df.bindingHandlers.tests {

    class TestModel {
        items: KnockoutObservableArray<TestListItem>;
        values: KnockoutObservableArray<TestListItem>;

        constructor() {
            this.items = ko.observableArray<TestListItem>([]);
            this.values = ko.observableArray<TestListItem>([]);
        }
    }

    class TestListItem {
        id: KnockoutObservable<string>;
        text: KnockoutObservable<string>;
        locked: KnockoutObservable<boolean>;

        constructor(id: string, text: string, locked: boolean = false) {
            this.id = ko.observable(id);
            this.text = ko.observable(text);
            this.locked = ko.observable(locked);
        }
    }

    export class Select2Helper {
        $element: JQuery;

        constructor($element: JQuery) {
            this.$element = $element;
        }

        get $container(): JQuery {
            return this.data.container;
        }

        get $inputField(): JQuery {
            return this.$container.find('input.select2-input');
        }
        
        get $dropdown(): JQuery {
            return this.data.dropdown;
        }

        get $items(): JQuery {
            return this.$dropdown.find('ul li');
        }

        openSelect(): void {
            this.$inputField.click();
        }

        selectItem(text: string): void {
            this.$items.filter((i: number, e: Element) => $(e).text() === text).click();
            this.$inputField.change();
        }

        private get data(): any {
            return this.$element.data('select2');
        }
    }

    describe('ko.bindingHandlers.multiselect', () => {
        var model: TestModel,
            $element: JQuery,
            $sandbox: JQuery,
            helper: Select2Helper;

        beforeEach(() => {
            $sandbox = sandbox();
            $element = $('<input type="hidden">').css('width', 100).appendTo($sandbox);
            helper = new Select2Helper($element);

            model = new TestModel();
            model.items([
                new TestListItem('A', 'Item A'),
                new TestListItem('B', 'Item B'),
                new TestListItem('C', 'Item C'),
                new TestListItem('D', 'Item D'),
                new TestListItem('E', 'Item E')
            ]);
        });

        it('should only allow binding on hidden inputs', () => {
            // Arrange
            var $select = $('<select>'),
                binding = { multiselect: [] };

            // Act
            var error: Error = null;
            try { ko.applyBindingsToNode($select[0], binding, model); }
            catch (ex) { error = ex; }

            // Assert
            expect(error).not.toBeNull();
            expect(error.message).toContain('ko.bindingHandlers.multiselect: Can only use with an input[type=hidden]');
        });

        it('should create multiselect select2 on element', () => {
            // Arrange
            var binding = { multiselect: model.items };

            // Act
            ko.applyBindingsToNode($element[0], binding, model);

            // Assert
            console.log($sandbox[0]);
            expect($element).toHaveClass('select2-offscreen');
            expect(helper.$container).toExist();
            expect(helper.$container).toHaveClass('select2-container-multi');
            expect(helper.$inputField).toExist();
            expect(helper.$inputField).toHaveClass('select2-input');
        });

        it('should pull elements from the provided values', () => {
            // Arrange
            var binding = { multiselect: model.items };
            ko.applyBindingsToNode($element[0], binding, model);

            // Precondition
            expect(helper.$items.length).toBe(0);

            // Act
            helper.openSelect();

            // Assert
            expect(helper.$items.length).toBe(5);
            expect(helper.$items.eq(0)).toHaveText('Item A');
            expect(helper.$items.eq(1)).toHaveText('Item B');
            expect(helper.$items.eq(2)).toHaveText('Item C');
            expect(helper.$items.eq(3)).toHaveText('Item D');
            expect(helper.$items.eq(4)).toHaveText('Item E');
        });

        it('should respect changes to the observable element source', () => {
            // Arrange
            var binding = { multiselect: model.items };
            ko.applyBindingsToNode($element[0], binding, model);

            // Act
            model.items.push(new TestListItem('Z', 'Item Z', true));

            // Assert
            helper.openSelect();
            expect(helper.$items.length).toBe(6);
            expect(helper.$items.eq(5)).toHaveText('Item Z');
        });

        it('should allow you to select an item and store its value', () => {
            // Arrange
            var binding = { multiselect: model.items, multiselectvalue: model.values };
            ko.applyBindingsToNode($element[0], binding, model);
            
            // Precondition
            expect(model.values().length).toBe(0);

            // Act
            helper.openSelect();
            helper.selectItem('Item C');

            // Assert
            expect(model.values().length).toBe(1);
        });
    });
}