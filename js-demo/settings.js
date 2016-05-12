/**
 * settings.js
 *
 * Настройки состава корзины
 * Регулирование количества
 * Удаление
 * Пересчет
 *
 * @author      Pereskokov Yurii
 * @copyright   2016 Pereskokov Yurii
 * @license     Mediasite LLC
 * @link        http://www.mediasite.ru/
 */

$(document).ready(function(){

    /**
     * Класс для удаления товара из корзины
     * @type {string}
     */
    var removeButton = '.js-cart-remove-button';

    /**
     * Класс для добаления единицы
     * @type {string}
     */
    var plusButton   = '.js-cart-plus-button';

    /**
     * Класс для удаление единицы элемента
     * @type {string}
     */
    var minusButton  = '.js-cart-minus-button';

    /**
     * Класс для изменения количества элемента
     * @type {string}
     */
    var countInput   = '.js-cart-count-input';

    /**
     * URL для отправки информации об удалении товара
     * @type {string}
     */
    var removeProductUrl = '/api/cart.remove/';

    /**
     * URL для отправки информвции о добавленном товаре
     * @type {string}
     */
    var addProductUrl = '/api/cart.add/';

    /**
     * Класс в который обернута вся корзина
     * @type {string}
     */
    var cart = '.js-cart';

    /**
     * Переменная для хранения значения временной задержки
     */
    var syncTimeout;

    /**
     * Событие удаления позиции товара из корзины
     */
    $(document).on({
        click:function(event){
            event.preventDefault();

            var $this = $(this);

            // Дергаем идентификатор товара
            var id = $this.attr('data-id');
            var type = $this.attr('data-type');

            // Удаляем товар из DOM
            $('tr[data-id=' + id + '][data-type="' + type + '"]').hide(400);
            $('tr[data-id=' + id + '][data-type="' + type + '"]').remove();

            removeCart();

            // Отправляем ajax запрос на добавление
            $.ajax({
                type: "POST",
                url: removeProductUrl,
                data: {id : id, type : type},
                success: function(response)
                {
                    if (response.status.code != 1001) {
                        if (response.data.succes === 'Ok') {

                            // Обновляем состояние корзины (вверху)
                            update(response);
                        }
                    } else {
                        alert('Возникла ошбка при удалении товара из корзины');
                    }
                }
            }); // $.ajax
        }
    }, removeButton);

    /**
     * Функция проверки удаления корзины
     */
    function removeCart()
    {
        // если нет указанных элементов, то удаляю всю корзину
        // и делаю невидимой корзину вверху

        var count = 0;

        $('.js-cart tr').each(function(){
            count = count + 1;
        });

        if (count <= 1) {
            $('.js-cart').empty();
            $('.js-cart').append('<div class="emptyCart">Ваша корзина пуста</div>');

            $(".cartBlock").addClass('js-noDisplay3');
        }
    }

    /**
     * Событие добавления единицы товара
     */
    $(document).on({
        click:function(event){
            event.preventDefault();

            var $this = $(this);

            // Дергаем идентификатор товара
            var id = $this.attr('data-id');
            var type = $this.attr('data-type');
            
            var count = $('input[data-id=' + id + '][data-type="' + type + '"]').val();

            if (isNaN(count)) {
                count = 1;
            } else {

                count = Number(count);

                if (count >= 99999) {
                    count = 99999;
                } else {
                    count = count + 1;
                }
            }

            calculatedSumm(id, count, type);
            send(id, count, type);
        }
    }, plusButton);

    /**
     * Событие удаление единицы товара
     */
    $(document).on({
        click:function(event){
            event.preventDefault();

            var $this = $(this);

            // Дергаем идентификатор товара
            var id = $this.attr('data-id');
            var type = $this.attr('data-type');

            var count = $('input[data-id=' + id + '][data-type="' + type + '"]').val();

            if (isNaN(count)) {
                count = 1;
            } else {

                count = Number(count);

                if (count <= 1) {
                    count = 1;
                } else {
                    count = count - 1;
                }
            }

            calculatedSumm(id, count, type);
            send(id, count, type);
        }
    }, minusButton);


    /**
     * Событие ручного ввода единицы товара в поле input
     */
    $(document).on({
        change:function(event){
            var $this = $(this);

            // Дергаем идентификатор товара
            var id = $this.attr('data-id');
            var type = $this.attr('data-type');

            var count = $this.val();

            count = Number(count);

            if (count <= 1) {
                count = 1;
                $this.val(count);
            }

            if (count >= 99999) {
                count = 99999;
                $this.val(count);
            }

            calculatedSumm(id, count, type);
            send(id, count, type);
        }
    }, countInput);

    /**
     * Пересчет суммы заказа
     */
    function calculatedSumm(id, count, type)
    {
        // Добавляем единичку в ячейку
        $('input[data-id=' + id + '][data-type="' + type + '"]').val(count);

        // пересчитываем сумму заказа
        var $sum = $('tr[data-id=' + id + '][data-type="' + type + '"] .js-summ');
        var price = $sum.attr('data-price');

        $sum.empty();
        $sum.append(formatCost(count * price));

        // Пересчитываем всю корзину
        var total = 0;

        $(".js-summ").each(function (i) {
            var price = $(this).text();
            price = price.replace(/\s+/g, '');

            total += Number(price);
        });

        // Пересчитываем количество
        var totalCount = 0;

        $(".js-cart-count-input").each(function (i) {
            var count = $(this).val();

            totalCount += Number(count);
        });

        // Подтыкаем новые значения в DOM
        $(".js-cart-total-count").empty();
        $(".js-cart-total-count").append( formatCost(totalCount) + ' в корзине ' );
        $(".js-cart-total-cost").empty();
        $(".js-cart-total-cost").append( formatCost(total) );
    }

    /**
     * Функция отправки на сервер ajax запроса
     *
     * @param id
     * @param count
     * @param type
     */
    function send(id, count, type)
    {
        if(typeof syncTimeout != "undefined") {
            clearTimeout(syncTimeout);
        }

        syncTimeout = setTimeout(function(){
            $.ajax({
                type: "POST",
                url: addProductUrl,
                data: {id : id, count : count, type : type},
                success: function(response)
                {
                    if (response.status.code != 1001) {
                        if (response.data.succes === 'Ok') {
                            // Обновляем состояние корзины
                            update(response);
                        }
                    } else {
                        alert('Возникла ошбка при синхронизации товаров с сервером');
                    }
                }
            }); // $.ajax
        }, 300);
    }

    /**
     * Функция обновления состояния корзины
     */
    function update(response)
    {
        if (response.data.count != undefined && response.data.summ != undefined) {

            if ($(".cartBlock").hasClass('js-noDisplay3')) {
                $(".cartBlock").removeClass('js-noDisplay3');
            }

            $(".js-cart-total-count").empty();
            var count = formatCost(response.data.count) + ' в корзине ';
            $(".js-cart-total-count").append(count);

            $(".js-cart-total-cost").empty();
            var cost = response.data.summ;
            $(".js-cart-total-cost").append(formatCost(cost));
        }
    }

    /**
     * Форматирование значения цены
     *
     * @param cost
     * @returns {*}
     */
    function formatCost(cost) {
        return numberFormat(cost, 0, '', ' ')
    }

    function numberFormat( number, decimals, dec_point, thousands_sep ) {	// Format a number with grouped thousands
        //
        // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +	 bugfix by: Michael White (http://crestidg.com)

        var i, j, kw, kd, km;

        // input sanitation & defaults
        if( isNaN(decimals = Math.abs(decimals)) ){
            decimals = 2;
        }
        if( dec_point == undefined ){
            dec_point = ",";
        }
        if( thousands_sep == undefined ){
            thousands_sep = ".";
        }

        i = parseInt(number = (+number || 0).toFixed(decimals)) + "";

        if( (j = i.length) > 3 ){
            j = j % 3;
        } else{
            j = 0;
        }

        km = (j ? i.substr(0, j) + thousands_sep : "");
        kw = i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands_sep);
        //kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).slice(2) : "");
        kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).replace(/-/, 0).slice(2) : "");
        return km + kw + kd;
    }
});