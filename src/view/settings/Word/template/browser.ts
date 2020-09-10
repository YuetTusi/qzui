const template = `
{% if data.length===0 %}
    <div class="sort">
        <div class="empty-data">暂无数据</div>
    </div>
{% else %}
    {% for item in data %}
    <div class="sort" data-id="{{item.id}}">
        <div class="sort-bar">
            <label>浏览器分类：</label>
            <input type="text" data-id="{{item.id}}" value="{{item.sort}}" class="az-input" />
            <label>风险级别：</label>
            <select data-id="{{item.id}}" class="az-select" value="{{item.level}}">
                <option value="1" {% if item.level=="1" %} selected {% endif %}>1</option>
                <option value="2" {% if item.level=="2" %} selected {% endif %}>2</option>
                <option value="3" {% if item.level=="3" %} selected {% endif %}>3</option>
            </select>
            <button type="button" data-fn="addChild" class="az-button">添加内容</button>
            <button type="button" data-fn="delSort" class="az-button">删除</button>
        </div>
        <hr/>
        <div class="children">
            {% for i in item.children %}
            <div class="child-item">
                <label>内容：</label>
                <input type="text" value="{{i}}" class="az-input" />
                <button type="button" data-fn="delChild" class="az-button">删除</button>
            </div>
            {% endfor %}
        </div>
    </div>
    {% endfor %}
{% endif %}
`;

export { template };