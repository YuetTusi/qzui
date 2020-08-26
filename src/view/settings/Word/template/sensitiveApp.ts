const template = `
{% if data.length===0 %}
    <div class="sort">
        <div class="empty-data">暂无数据</div>
    </div>
{% else %}
    {% for item in data %}
        <div class="sort" data-id="{{item.id}}">
            <div class="sort-bar">
                <label>分类：</label>
                <input type="text" data-id="{{item.id}}" value="{{item.sort}}" class="az-input" />
                <button type="button" data-fn="addChild" class="az-button">添加应用</button>
                <button type="button" data-fn="delSort" class="az-button">删除</button>
            </div>
            <hr/>
            <div class="children">
                {% for i in item.children %}
                <div class="child-item">
                    <div>
                        <label>App名称：</label>
                        <input type="text" data-fn="app" value="{{i.app}}" class="az-input" />
                    </div>
                    <div>
                        <label>App包名：</label>
                        <input type="text" data-fn="package" value="{{i.package}}" class="az-input" />
                    </div>
                    <button type="button" data-fn="delChild" class="az-button">删除</button>
                </div>
                {% endfor %}
            </div>
        </div>
    {% endfor %}
{% endif %}
`;

export { template };