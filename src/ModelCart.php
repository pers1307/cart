<?php
/**
 * ModelCart.php
 * Модель для корзины
 *
 * @author      bmxnt            <bmxnt@mediasite.ru>
 * @author      Pereskokov Yurii <pers1307@mediasite.ru>
 * @version     1.0
 * @license     Mediasite LLC
 * @link        http://www.mediasite.ru/
 */

/*
DROP TABLE IF EXISTS `mp_cart`;
    CREATE TABLE `mp_cart` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` varchar(255) NOT NULL,
    `item_id` int(11)      NOT NULL,
    `amount`  int(11)      NOT NULL,
    `cost`    double(11)   NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
 */

/**
 * Класс реализующий логику корзины
 *
 * Class ModelCart
 *
 * DB Shema
 *
 * DROP TABLE IF EXISTS `mp_cart`;
 *  CREATE TABLE `mp_cart` (
 *  `id` int(11) NOT NULL AUTO_INCREMENT,
 *  `user_id` varchar(255) NOT NULL,
 *  `item_id` int(11)      NOT NULL,
 *  `amount`  int(11)      NOT NULL,
 *  `cost`    double(11)   NOT NULL,
 *  PRIMARY KEY (`id`)
 *  ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
 */
class ModelCart extends MSBaseTape
{
    /**
     * Уникальный идентификатор пользователя
     * @var int
     */
    protected $_userId = 0;

    /**
     * Время жизни Cookie у клиента
     * @var int
     */
    protected $_cookieLifetime = 31556926; // One year

    /**
     * Таблица корзины в базе
     * @var string
     */
    protected $_cartTableName = 'cart';

    /**
     * Таблица с товарами
     * @var string
     */
    protected $_itemsTableName = 'catalog_rent_items';

    /**
     * Таблица с товарами 2
     * @var string
     */
    protected $_itemsTableName2 = 'rent_lent';

    /**
     * Количество товаров в корзине
     * @var int
     */
    protected $_cartItemsCount;

    /**
     * Стоимость товаров в корзине
     * @var double
     */
    protected $_cartItemsCost;

    public function __construct($config = array()) {
        parent::__construct($config);

        $this->_userId = $this->getUserId();
        $this->_itemsTableName  = PRFX . $this->_itemsTableName;
        $this->_itemsTableName2 = PRFX . $this->_itemsTableName2;
        $this->_cartTableName   = PRFX . $this->_cartTableName;
    }

    /**
     * Возвращает уникальный идентификатор корзины пользователя,
     * если его нет, то генерирует новый
     *
     * @return int
     */
    public function getUserId()
    {
        $userId = MSCookie::get('cart_user_id');

        if (is_null($userId)) {
            $userId = md5(microtime() . COOKIE_SALT . rand(5, 55));
            MSCookie::set('cart_user_id', $userId, $this->_cookieLifetime);
        }

        return $userId;
    }

    /**
     * Проверка существования товара в корзине у пользователя
     *
     * @param int    $itemId идентификатор товара
     * @param string $type   тип таблицы
     * @return mixed|null
     */
    public function exists($itemId, $type)
    {
        if (!$itemId) {
            return null;
        }

        if (!$type) {
            return null;
        }

        return MSCore::db()->getOne(
            'SELECT id FROM `' . $this->_cartTableName .
            '` WHERE item_id = ' . $itemId .
            ' AND user_id = "' . $this->_userId . '"' .
            ' AND `type` = "' . $type . '"'
        );
    }

    /**
     * Пересчитывает и возвращает общую стоимость товаров
     *
     * @return double
     */
    public function getCostItems()
    {
        $this->_cartItemsCost = MSCore::db()->getOne(
            'SELECT SUM(cart.cost) FROM `' . $this->_cartTableName . '` AS cart ' .
            'WHERE cart.user_id = "' . $this->_userId . '"'
        );

        return $this->_cartItemsCost;
    }

    /**
     * Возвращает количество товаров в корзине
     *
     * @return int
     */
    public function getCountItems()
    {
        $this->_cartItemsCount = (int) MSCore::db()->getOne(
            'SELECT SUM(cart.amount) FROM `' . $this->_cartTableName . '` AS cart '.
            'WHERE cart.user_id = "' . $this->_userId . '"'
        );

        return $this->_cartItemsCount;
    }

    /**
     * Возвращает элементы в корзине указанного типа
     *
     * @param string $type тип товара
     *
     * @return array|null
     */
    public function getItemsType($type)
    {
        if (!$type) {
            return null;
        }

        if ($type == 'catalog') {
            $query = new MSTable('' . $this->_cartTableName . ' cart');
            $query->setFields(['cart.`amount`', 'cart.`cost`', 'cart.`type`', 'catalog.*', 'articles.`code` as path']);
            $query->setJoin('' . $this->_itemsTableName . ' catalog', 'INNER', 'cart.`item_id` = catalog.`id`', 'idJoin');
            $query->setJoin('{catalog_rent_articles} articles', 'INNER', 'catalog.`parent` = articles.`id`', 'pathJoin');
            $query->setFilter('cart.`type`="catalog"');
            $query->setFilter('cart.`user_id`="' . $this->_userId . '"');
        } elseif ($type == 'lent') {
            $query = new MSTable('' . $this->_cartTableName . ' cart');
            $query->setFields(['cart.`amount`', 'cart.`cost`', 'catalog.*']);
            $query->setJoin('' . $this->_itemsTableName2 . ' catalog', 'INNER', 'cart.`item_id` = catalog.`id`', 'pathJoin');
            $query->setFilter('cart.`type`="lent"');
            $query->setFilter('cart.`user_id`="' . $this->_userId . '"');
        } else {
            return null;
        }

        return $query->getItems();
    }

    /**
     * Добавление товара в корзину
     *
     * @param int $itemId id товара
     * @param int $count количество товара
     * @param string $type тип товара (к какой таблице он принадлежит)
     *
     * @return bool
     */
    public function add($itemId, $count, $type)
    {
        if (!$itemId) {
            return false;
        }

        if (!$count) {
            return false;
        }

        if (!$type) {
            return false;
        }

        // Разделение по типу
        if ($type == 'catalog') {
            $itemObject = MSCore::db()->getRow('SELECT * FROM `' . $this->_itemsTableName . '` WHERE id=' . $itemId);
        } elseif ($type == 'lent') {
            $itemObject = MSCore::db()->getRow('SELECT * FROM `' . $this->_itemsTableName2 . '` WHERE id=' . $itemId);
        }

        $itemObject['price'] = $this->deleteBlank($itemObject['price']);

        if ($itemObject) {
            $id = $this->exists($itemId, $type);

            if($id) {
                MSCore::db()->execute(
                    'UPDATE `' . $this->_cartTableName .
                    '` SET amount = ' . $count . ', cost = ' . $this->deleteBlank($count * $itemObject['price']) .
                    ' WHERE id = ' . $id . ' ' .
                    ' AND `type` ="' . $type . '"'
                );
            } else {
                $data = [
                    'user_id' => $this->_userId,
                    'item_id' => $itemId,
                    'amount'  => $count,
                    'cost'    => $this->deleteBlank($count * $itemObject['price']),
                    'type'    => $type
                ];

                MSCore::db()->insert($this->_cartTableName, $data);

                unset($data);
            }

            return true;
        }

        return false;
    }

    /**
     * Удаление товара из корзины
     *
     * @param $itemId идентификатор товара
     * @param $type   тип товара
     *
     * @return bool
     */
    public function remove($itemId, $type)
    {
        if (!$itemId) {
            return false;
        }

        if (!$type) {
            return false;
        }

        if ($cartId = $this->exists($itemId, $type)) {

            MSCore::db()->execute(
                'DELETE FROM `' . $this->_cartTableName . '` WHERE id = ' . $cartId
            );

            // Remove cookie if empty cart
            $count = intval(MSCore::db()->getOne('SELECT COUNT(*) FROM `' . $this->_cartTableName . '` WHERE `user_id` = "' . $this->_userId . '"'));

            if(empty($count)) {
                MSCookie::delete('cart_user_id');
            }

            return true;
        }

        return false;
    }

    /**
     * Удаление содержимого корзины пользователя
     *
     * @return bool
     */
    public function clear()
    {
        MSCore::db()->execute(
            'DELETE FROM `' . $this->_cartTableName . '` WHERE user_id = "' . $this->_userId . '"'
        );

        $this->_cartItemsCost = null;
        $this->_cartItemsCount = null;

        MSCookie::delete('cart_user_id');

        return true;
    }

    /**
     * Возвращает id всех элементов в корзине, указанного типа в корзине
     *
     * @return array|null
     */
    public function getItemsId($type)
    {
        if (!$type) {
            return null;
        }

        $ids = MSCore::db()->getAll(
            'SELECT cart.item_id FROM `' . $this->_cartTableName . '` AS cart ' .
            'WHERE cart.user_id = "' . $this->_userId . '"' .
            ' AND `type`="' . $type . '"'
        );

        $newIds = [];
        foreach ($ids as $key => $id) {
            $newIds[$id['item_id']] = $key;
        }

        return $newIds;
    }

    /**
     * Удаляет пробелы в строке
     * используется для цены
     *
     * @param string $string
     * @return string
     */
    protected function deleteBlank($string)
    {
        return str_replace(" ","",$string);
    }
}