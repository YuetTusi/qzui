export const template = `
<style type="text/css">
.publish{
    width:auto;
    max-height:600px;
    overflow-y:auto;
}

.publish h2{
    font-size: 1.6rem;
    padding:5px 10px;
    color:#fff;
    background-color:#416eb5;
}
.publish label{
    display:inline-block;
    width:55px;
    text-align:right;
    font-weight:bold;
    color:#222;
}
.publish .details{
    padding:5px 10px;
}
.publish ul{
    margin-top:10px;
}
.publish li{
    list-style-position:inside;
}

</style>
<div class="publish">
{% for item in logs %}
    <div>
        <div>
            <h2>程序版本：{{item[0] | replace('-', '.')}}</h2>
        </div>
        <div class="details">
            <div>
                <label>日期：</label>
                <span>{{item[1].Date}}</span>
            </div>
            <div>
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