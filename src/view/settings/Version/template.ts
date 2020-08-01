export const template = `
<style type="text/css">
.publish-list-root{
    width:auto;
    max-height:580px;
    overflow-y:auto;
}

.publish-list-root h2{
    font-size: 1.6rem;
    padding:5px 10px;
    color:#fff;
    text-shadow:1px 1px 1px #222;
    background-color:#416eb5;
}
.publish-list-root label{
    display:inline-block;
    width:55px;
    text-align:right;
    font-weight:bold;
    color:#222;
}
.publish-list-root .details{
    padding:5px;
}
.publish-list-root .spe{
    margin-bottom:12px;
}
.publish-list-root ul{
    margin:5px 12px;
    padding:0;
    border-radius:3px;
    border:1px solid #dbe9ff;
}
.publish-list-root li{
    list-style-type:none;
    padding:5px;
    color:#222;
}
.publish-list-root li:nth-child(2n+1){
    background-color:#f0f5ff;
}

</style>
<div class="publish-list-root">
{% for item in logs %}
    <div>
        <div>
            <h2>发行版本：{{item[0] | replace('-', '.')}}</h2>
        </div>
        <div class="details">
            <div>
                <label>日期：</label>
                <span>{{item[1].Date}}</span>
            </div>
            <div class="spe">
                <label>ID：</label>
                <span>{{item[1].ID}}</span>
            </div>
            <div>
                <ul>
                    {% for log in item[1].Item %}
                    <li>{{log}}</li>
                    {% endfor %}
                </ul>
            </div>
        </div>
    </div>
{% endfor %}
</div>
`;