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
    text-shadow:1px 1px 1px #222;
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
    padding:5px;
}
.publish .spe{
    margin-bottom:12px;
}
.publish ul{
    margin:5px 12px;
    padding:0;
    border-radius:3px;
    border:1px solid #dbe9ff;
}
.publish li{
    list-style-type:none;
    padding:5px;
    color:#222;
}
.publish li:nth-child(2n+1){
    background-color:#f0f5ff;
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