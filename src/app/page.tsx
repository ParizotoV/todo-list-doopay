'use client';

import React, { useEffect, useMemo, useState } from 'react';

type TodoListParams = {
	name: string;
	timestamp: Date;
	finished: boolean;
	uuid: number;
	visible: boolean;
};

export default function Home() {
	// Valor do input
	const [value, setValue] = useState<string>('');

	// Array controladora
	const [todoList, setTodoList] = useState<TodoListParams[]>([]);

	// Porcentagens concluidas
	const [porcentageConcluidas, setPorcentageConcluidas] = useState<number>(0);
	const [porcentageNConcluidas, setPorcentageNConcluidas] = useState<number>(0);

	// Quantidade de tarefas concluidas
	const quantidadeTarefaConcluida = (list: TodoListParams[]): number => {
		const concluidas = list.filter(todo => todo.finished === true).length;
		return concluidas;
	};

	// useMemo para calcular toda vez que mudar o todoList
	const numTarefasConcluidas = useMemo(
		() => quantidadeTarefaConcluida(todoList),
		[todoList],
	);

	const salvarLocalStorage = (list: TodoListParams[]) => {
		window.localStorage.setItem(
			'todo-lists',
			JSON.stringify({
				items: list,
			}),
		);
	};

	// Adicionando nova tarefa
	const adicionar = (valor: string) => {
		const list = todoList;

		list.push({
			name: valor,
			finished: false,
			timestamp: new Date(),
			uuid: Math.random(),
			visible: true,
		});

		setTodoList(list);

		salvarLocalStorage(list);

		setValue('');
	};

	// Setando a tarefa para concluida
	const concluirTarefa = (uuid: number) => {
		let tarefaAEditar = {} as TodoListParams;

		const tarefa = todoList.find(todo => todo.uuid === uuid);
		if (tarefa)
			tarefaAEditar = {
				...tarefa,
				finished: true,
			};

		const novasTarefas = todoList.filter(todo => todo.uuid !== uuid);

		novasTarefas.push(tarefaAEditar);

		setTodoList(novasTarefas);

		salvarLocalStorage(novasTarefas);

		setTimeout(() => {
			const indice = novasTarefas.indexOf(tarefaAEditar);
			novasTarefas[indice] = { ...novasTarefas[indice], visible: false };
			setTodoList([...novasTarefas]);
		}, 30000);
	};

	useEffect(() => {
		const lista: { items: TodoListParams[] } = { items: [] };

		const listLocalStorage = JSON.parse(
			window.localStorage.getItem('todo-lists') || '{ items: [] }',
		);

		if (Object.keys(listLocalStorage).length > 0) {
			lista.items = listLocalStorage.items;
		}

		setTodoList(lista.items || []);
	}, []);

	useEffect(() => {
		setPorcentageConcluidas(
			Math.ceil((numTarefasConcluidas * 100) / todoList.length) || 0,
		);
		setPorcentageNConcluidas(
			Math.ceil(
				((todoList.length - numTarefasConcluidas) * 100) / todoList.length,
			) || 0,
		);
	}, [numTarefasConcluidas, todoList.length]);

	return (
		<main className="flex items-center justify-center flex-col gap-12 mt-14">
			<h1 className="font-bold">LISTA DE TAREFAS</h1>

			<div className="w-4/12 grid gap-4 xl:grid-flow-col lg:grid-cols-3">
				<div className="flex flex-col gap-2">
					<span className="text-gray-300 font-medium">Total de tarefas</span>
					<h3 className="text-4xl font-bold">{todoList.length}</h3>
				</div>
				<div className="flex flex-col gap-2">
					<span className="text-gray-300 font-medium">Concluídas</span>
					<h3
						className={`${
							porcentageConcluidas >= 50 ? 'text-green-500' : 'text-red-500'
						} text-4xl font-bold`}>
						{porcentageConcluidas}%
					</h3>
				</div>
				<div className="flex flex-col gap-2">
					<span className={`text-gray-300 font-medium`}>Pendentes</span>
					<h3
						className={`${
							porcentageNConcluidas >= 50 ? 'text-red-500' : 'text-green-500'
						} text-4xl font-bold`}>
						{porcentageNConcluidas}%
					</h3>
				</div>
			</div>

			<div className="w-4/12 flex gap-2">
				<input
					placeholder="Escreva uma nova tarefa"
					className="p-2 rounded-lg border border-inherit w-full"
					value={value}
					name="value"
					onChange={event => setValue(event.target.value)}
				/>
				<button
					className="text-sm font-semibold bg-indigo-600 p-2 text-white rounded-lg w-64"
					onClick={() => adicionar(value)}>
					ADICIONAR
				</button>
			</div>

			<div className="w-4/12 flex flex-col gap-4">
				{todoList.map(({ name, finished, uuid, visible }, index) => {
					if (visible)
						return (
							<div
								key={index}
								className="flex justify-between w-full p-2 border rounded-lg items-center">
								<span
									className={`${
										finished ? 'text-neutral-400' : 'text-neutral-900'
									}`}>
									{name}
								</span>
								{!finished && (
									<button
										className="bg-green-500 text-white rounded-lg text-sm font-semibold p-2"
										onClick={() => concluirTarefa(uuid)}>
										COMPLETAR
									</button>
								)}
							</div>
						);
					return null;
				})}
			</div>
		</main>
	);
}
