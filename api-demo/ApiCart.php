<?php
/**
 * ApiCart.php
 *
 * Api для взаимодействия с корзиной
 *
 * @author      bmxnt
 * @author      Pereskokov Yurii
 * @license     Mediasite LLC
 * @link        http://www.mediasite.ru/
 */

/**
 * Класс Api для взаимодействия с корзиной
 *
 * Class ApiCart
 */
class ApiCart extends MSBaseApi {

     protected $_errorMessages = array(
         '1000' => 'Некорректно заполненные поля',
         '1001' => 'Некорректный идентификатор товара',
         '1002' => 'Товар не существует',
         '1003' => 'Некорректное количество товара',
         '1004' => 'Отправка заказа невозможна',
         '1005' => 'Корзина пуста',
     );

    /**
     * Добавление товара в корзину
     */
     public function addAction(){

         if (!isset($_POST['id']) || !isset($_POST['count']) || !isset($_POST['type'])) {
             $this->errorAction(1001, 'Custom system error', ['postArgument' => 'noPostArgument']);
         }

         $id    = getInt($_POST['id']);
         $count = getInt($_POST['count']);
         $type  = htmlspecialchars(trim($_POST['type']));

         // Вернуть количество товаров и их общую сумму, новую
         $cart = new ModelCart();
         $status = $cart->add($id, $count, $type);

         if(!$status) {
            $this->errorAction(1002);
         }

         $summ  = $cart->getCostItems();
         $count = $cart->getCountItems();

         $this->addData(['succes' => 'Ok', 'count' => $count, 'summ' => $summ]);
         $this->successAction();
    }

    /**
     * Удаление товара из корзины
     */
    public function removeAction()
    {
        if (!isset($_POST['id']) || !isset($_POST['type'])) {
            $this->errorAction(1001, 'Custom system error', ['postArgument' => 'noPostArgument']);
        }

        $id   = getInt($_POST['id']);
        $type = htmlspecialchars(trim($_POST['type']));

        if (empty($id)) {
            $this->errorAction(1001);
        }

        $cart = new ModelCart();
        $cart->remove($id, $type);

        $summ  = $cart->getCostItems();
        $count = $cart->getCountItems();

        $this->addData(['succes' => 'Ok', 'count' => $count, 'summ' => $summ]);
        $this->successAction();
    }
}