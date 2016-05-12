/**
 * bid.js
 *
 * Оформление заявки на содержимое корзины корзины
 *
 * @author      Pereskokov Yurii
 * @copyright   2016 Pereskokov Yurii
 * @license     Mediasite LLC
 * @link        http://www.mediasite.ru/
 */

$(document).ready(function(){

    // Объект для файла загрузки
    var uploader2;

    // Проверка, что есть уже загруженный файл
    var fileFirst2 = false;

    $('input[name="phone"]').mask("+7 (999) 999-99-99");

    // Назначаем id элементу из формы
    $("input[name='files2']").attr('id', 'browse2');
    // Потом дергаем этот элемент из DOM
    var elem1 = document.getElementById("browse2");

    var fileUrl = $(".js-form-delivery").attr('data-file');

    // Подтыкаем
    var id = 'order';

    uploader2 = new plupload.Uploader({
        multipart_params: {id : id},
        browse_button: elem1,
        url: fileUrl,
        multi_selection: false,
        filters: {
            max_file_size: '5mb',
            mime_types: [
                {title: "Image files", extensions: "jpg,gif,png,jpeg,doc,docx,xls,xlsx"}
            ]
        }
    });

    uploader2.init();

    uploader2.bind('FilesAdded', function(up, files) {
        if (fileFirst2 == false) {

            var html = '';
            plupload.each(files, function(file) {
                html += '<span data-id="' + file.id + '">' + file.name + ' <a class="deleteFile-delivery" href="#">&times;</a></span>';
            });

            $(".js-form-delivery .fileUploadList").append(html);
            uploader2.start();
            fileFirst2 = true;
        } else {
            var count = uploader2.files.length;
            var tmp = uploader2.files;

            for (var i = 0; i < count; i++) {
                if (i != 0) {
                    uploader2.removeFile(tmp[i]);
                }
            }

            alert('Нельзя прикрепить к заявке более одного файла');
        }
    });

    uploader2.bind('UploadProgress', function(up, file) {
        if ($(".js-form-delivery .fileUpload").hasClass('error')) {
            $('.js-form-delivery .fileUpload').removeClass('error');
            $('.js-form-delivery .fileUpload').next().remove();
        }

        $(".js-form-delivery").addClass('loading');
    });

    uploader2.bind('FileUploaded', function(up, file, info) {
        // Файл загружен
        var response = JSON.parse(info.response);
        $(".js-form-delivery").removeClass('loading');

        if (response.data.error == 'maxSizeFile') {
            $(".js-form-delivery .fileUploadList").empty();
            uploader2.removeFile(uploader2.files[0]);
            $(".js-form-delivery .fileUpload").after("<span class='errorText'>Файл слишком большой (файл не должен быть больше 5 Мб)</span>");
        }

        if (response.data.error == 'noAvaliable') {
            $(".js-form-delivery .fileUploadList").empty();
            uploader2.removeFile(uploader2.files[0]);
            $(".js-form-delivery .fileUpload").after("<span class='errorText'>Файл имеет не допустимое расширение (допустимы расширения: jpg,gif,png,jpeg,doc,docx,xls,xlsx)</span>");
        }
    });

    uploader2.bind('Error', function(up, err) {
        if (err.code == -601) {
            $(".js-form-delivery .fileUpload").addClass('error');
            $(".js-form-delivery .fileUploadList").empty();
            $(".js-form-delivery .fileUpload").after("<span class='errorText'>Файл такого расширения или такого размера загружать нельзя</span>");
        }
    });

    // Событие на удаление файла
    $(document).on({
        click:function(event){
            event.preventDefault();
            deleteFile();
        }
    },'.js-form-delivery .deleteFile-delivery');


    /**
     * Префикс для формы
     * @type {string}
     */
    var form = '.js-form';

    /**
     * Постфикс для идентификации формы
     * @type {string}
     */
    var postFix = '-delivery';

    /**
     * Массив с названиями input'ов
     * @type {Array}
     */
    var inputsName = ['name', 'email', 'phone'];

    /**
     * Массив с названиями textarea'ов
     * @type {Array}
     */
    var textareasName = ['address2', 'comment'];

    /**
     * Сообщение на случай, если поле не заполнено (ошибка первого уровня)
     * @type {string}
     */
    var errorLvl1 = "<span class='errorText'>Поле не заполнено</span>";

    /**
     * Отображение ошибки второго уровня для input'ов
     * (последовательность ошибок должна быть такая же как у input'ов)
     * @type {Array}
     */
    var errorLvl2 = [
        "<span class='errorText'>Имя должно содержать только буквы</span>",
        "<span class='errorText'>Электронный адрес введен не верно</span>",
        "<span class='errorText'>Поле должно содержать только цифры</span>"
    ];

    /**
     * Надпись отображается при успешной отправки формы
     * @type {string}
     */
    var theEnd = "<span class='succes'>Спасибо за заказ. Мы свяжемся с вами в ближайшее время.</span>";


    /**
     * Класс на который повешены текстовые ошибки
     * @type {string}
     */
    var errorText = 'errorText';

    /**
     * Класс на который повешены ошибки на input и textarea
     * @type {string}
     */
    var error = 'error';

    /**
     * Кастомные переменные для проекта
     */


    $(document).on('submit', form + postFix, function(e){
        e.stopPropagation();
        e.preventDefault();

        var vars = $(this).serialize();
        var furl = $(this).attr('action');

        $.ajax({
            type: "POST",
            url: furl,
            data: vars,
            success: function(response)
            {
                if (response.status.code != 1001) {
                    if (response.data.succes === 'Ok') {
                        $(form + postFix).empty();
                        $(form + postFix).append(theEnd);

                        // скрыть корзину
                        $(".cartBlock").addClass('js-noDisplay3');
                    }
                } else {

                    if (response.data.honeyPot != undefined) {
                        return;
                    }

                    // снять везде класс ошибки
                    inputsName.forEach(function(item, i) {
                        $(form + postFix + " input[name='" + item + "']").removeClass(error);
                    });

                    textareasName.forEach(function(item, i) {
                        $(form + postFix + " textarea[name='" + item + "']").removeClass(error);
                    });

                    $(form + postFix + " input[name='name']").removeClass('error');
                    $(form + postFix + " input[name='phone']").removeClass('error');
                    $(form + postFix + " textarea[name='comment']").removeClass('error');

                    $(form + postFix + " span[class='" + errorText + "']").remove();


                    //inputsName.forEach(function(item, i) {
                    //    $(form + postFix + " input[name='" + item + "']").removeClass(error);
                    //
                    //    console.log(response.data.error[item]);
                    //
                    //    if (typeof response.data.error[item] != 'undefined') {
                    //
                    //    }
                    //
                    //
                    //
                    //
                    //});

                    if (response.data.error.name != undefined) {
                        if (response.data.error.name === 'name!') {
                            $(".js-form-delivery input[name='name']").addClass( "error" );
                            $(".js-form-delivery input[name='name']").after("<span class='errorText'>Поле не заполнено</span>");
                        }

                        if (response.data.error.name === 'name!!') {
                            $(".js-form-delivery input[name='name']").addClass( "error" );
                            $(".js-form-delivery input[name='name']").after("<span class='errorText'>Имя должно содержать только буквы</span>");
                        }
                    }

                    if (response.data.error.phone != undefined) {
                        if (response.data.error.phone === 'phone!') {
                            $(".js-form-delivery input[name='phone']").addClass( "error" );
                            $(".js-form-delivery input[name='phone']").after("<span class='errorText'>Поле не заполнено</span>");
                        }
                        if (response.data.error.phone === 'phone!!') {
                            $(".js-form-delivery input[name='phone']").addClass( "error" );
                            $(".js-form-delivery input[name='phone']").after("<span class='errorText'>Поле должно содержать только цифры</span>");
                        }
                    }

                    if (response.data.error.email != undefined) {
                        if (response.data.error.email === 'email!') {
                            $(".js-form-delivery input[name='email']").addClass( "error" );
                            $(".js-form-delivery input[name='email']").after("<span class='errorText'>Поле не заполнено</span>");
                        }
                        if (response.data.error.email === 'email!!') {
                            $(".js-form-delivery input[name='email']").addClass( "error" );
                            $(".js-form-delivery input[name='email']").after("<span class='errorText'>Электронный адрес введен не верно</span>");
                        }
                    }

                    /**
                     * Кастомные действия для данного проекта
                     */

                    if (response.data.error.payment != undefined) {
                        if (response.data.error.payment === 'payment!') {
                            alert('Способ оплаты не указан');
                        }
                    }

                    if (response.data.error.delivery != undefined) {
                        if (response.data.error.delivery === 'delivery!') {
                            alert('Способ доставки не указан');
                        }
                    }
                }
            }
        }); // $.ajax

    }); // $(document).on('submit', '#js-formCall', function(e)

    // События по очистке формы
    $(document).on('focus', "input[name='name']", function(e) {
        if ($(this).hasClass('error')) {
            $(this).removeClass('error');
            $(this).next().remove();
        }
    });

    $(document).on('focus', "input[name='phone']", function(e) {
        if ($(this).hasClass('error')) {
            $(this).removeClass('error');
            $(this).next().remove();
        }
    });

    $(document).on('focus', "input[name='email']", function(e) {
        if ($(this).hasClass('error')) {
            $(this).removeClass('error');
            $(this).next().remove();
        }
    });

    $(document).on('focus', "textarea[name='comment']", function(e) {
        if ($(this).hasClass('error')) {
            $(this).removeClass('error');
            $(this).next().remove();
        }
    });

    function reset()
    {
        var $object = $("input[name='name']");
        resetClass($object);
        $object = $("input[name='phone']");
        resetClass($object);
        $object = $("input[name='email']");
        resetClass($object);
        $object = $("textarea[name='comment']");
        resetClass($object);
        $object = $(".js-form-delivery .fileUpload");
        resetClass($object);
    }

    function resetClass($object)
    {
        if ($object.hasClass('error')) {
            $object.removeClass('error');
            $object.next().remove();
        }
    }

    function deleteFile()
    {
        var deleteFileUrl = $(".js-form-delivery").attr('data-deleteFile');

        if (deleteFileUrl == undefined) {
            return false;
        }

        $.ajax({
            type: "POST",
            url: deleteFileUrl,
            success: function(response)
            {
                if (response.status.code != 1001) {
                    if (response.data.succes === 'Ok') {
                        if (fileFirst2 == true) {
                            $(".js-form-delivery .fileUploadList").empty();
                            uploader2.removeFile(uploader2.files[0]);
                            fileFirst2 = false;
                        }
                    }
                }
            }
        }); // $.ajax
    }
});