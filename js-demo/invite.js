/**
 * invite.js
 *
 * Скрипты отвечающие за приглашение в корзину
 * Добавление товара
 * Ссылка на корзину
 * Блокирование возможности повторного добавление товара
 * Обновление корзины (количества товара и общей суммы)
 *
 * @author      Pereskokov Yurii
 * @copyright   2016 Pereskokov Yurii
 * @license     Mediasite LLC
 * @link        http://www.mediasite.ru/
 */

/**
 * Пример всплывающего окна в DOM
 *
 <div class="js-noDisplay2">
 <div class="modal t2">
 <div class="modal-window-close">&times;</div>

 <div class="modalTop">
 Товар добавлен!
 </div>

 <div class="modalContent">
 Товар успешно добавлен в корзину

 <div class="cartButtons">
 <a class="button gray" href="">Продолжить покупки</a>
 <a class="button" href="">Оформить</a>
 </div>
 </div>
 </div>
 </div>
 */

/**
 * Пример html, который весит на элементе,
 * при нажатии на который товар добавляется в корзину
 *
 * <a href='' class='button added'>
 *    <span class='b1'>Заказать</span>
 *    <span class='b2'>В корзине</span>
 * </a>
 */

$(document).ready(function(){

    /**
     * Класс всплывашки, которую надо дернуть из DOM
     * @type {string}
     */
    var modalWindowInDOM = '.js-noDisplay';

    /**
     * Идентификатор этого класса (в случае если всплывашка не одна)
     * @type {string}
     */
    var numberModalWindowInDOM = '2';

    /**
     * URL для отправки информвции о добавленном товаре
     * @type {string}
     */
    var addProductUrl = '/api/cart.add/';

    /**
     * Событие отвечает за нажатие по кнопке "Заказать"
     */
    $(document).on({
        click:function(event){
            event.preventDefault();

            var $this = $(this);
            
            // Проверяем есть класс added (что товар уже добавлен в корзину)
            if (!$this.hasClass('added')) {

                // Дергаем идентификатор товара
                var id = $this.attr('data-id');
                var type = $this.attr('data-type');

                // Отправляем ajax запрос на добавление
                $.ajax({
                    type: "POST",
                    url: addProductUrl,
                    data: {id : id, count : 1, type : type},
                    success: function(response)
                    {
                        if (response.status.code != 1001) {
                            if (response.data.succes === 'Ok') {

                                // Обновляем состояние корзины
                                update(response);

                                // Показываем всплывающее окно
                                var content = $(modalWindowInDOM + numberModalWindowInDOM).html();
                                popUp(content);

                                // Блокируем товар, чтобы его нельзя было больше добавить
                                $this.addClass('added');
                            }
                        } else {
                            alert('Возникла ошбка при добавлении товара к корзину');
                        }
                    }
                }); // $.ajax
            }
        }
    },'.js-order');

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

    $(document).on({
        click:function(event){
            if (event.target == $(this)[0]) {
                $('body').css("overflow", "auto");
                closePopUp();
            }
        }
    },'.modal-window-wrap');

    $(document).on({
        click:function(){
            $('body').css("overflow", "auto");
            closePopUp();
            return false;
        }
    },'.modal-window-wrap .modal-window-close');

    $(document).on({
        click:function(){
            $('body').css("overflow", "auto");
            closePopUp();
            return false;
        }
    },'.js-close');

    function closePopUp()
    {
        $('body .modal-window-wrap').remove();
    }

    function popUp(content)
    {
        $('body').css("overflow", "hidden");

        $('body').append(
            '<div class="modal-window-wrap">' +
                '<div class="modal-window">' +
                    '<div class="modal-window-body">' +
                        content +
                    '</div>' +
                '</div>' +
            '</div>'
        );
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